
import { Context, Contract } from "fabric-contract-api";

type CaseEvent = {
  type: string;
  byUid: string;
  byRole: string;
  timestamp: string;
  details?: any;
  evidenceHashes?: string[];
  signature?: string;
};

type CaseRecord = {
  caseId: string;
  createdAt: string;
  createdByUid: string;
  createdByRole: string;
  title?: string;
  description?: string;
  evidenceHashes: string[];
  events: CaseEvent[];
  sealed: boolean;
  sealedAt?: string;
  sealedByUid?: string;
  sealedByRole?: string;
  latestAnchor?: {
    contentHash: string;
    action: string;
    timestamp: string;
    transactionId: string;
    byUid: string;
    byRole: string;
  };
};

export class CaseFlowContract extends Contract {
  private _txTime(ctx: Context) {
    const txTime = ctx.stub.getTxTimestamp();
    const seconds = Number(
      typeof txTime.seconds === "object" && txTime.seconds !== null && "toString" in txTime.seconds
        ? txTime.seconds.toString()
        : txTime.seconds
    );
    const millis = seconds * 1000 + Math.floor(txTime.nanos / 1_000_000);
    return new Date(millis).toISOString();
  }

  async createCase(ctx: Context, caseId: string, payloadJson: string) {
    const exists = await this._exists(ctx, caseId);
    if (exists) throw new Error("Case already exists");

    const payload = payloadJson ? JSON.parse(payloadJson) : {};
    const now = this._txTime(ctx);

    const rec: CaseRecord = {
      caseId,
      createdAt: now,
      createdByUid: payload.createdByUid || "unknown",
      createdByRole: payload.createdByRole || "unknown",
      title: payload.title,
      description: payload.description,
      evidenceHashes: payload.evidenceHashes || [],
      events: [
        {
          type: "CREATE_CASE",
          byUid: payload.createdByUid || "unknown",
          byRole: payload.createdByRole || "unknown",
          timestamp: now,
          details: { title: payload.title }
        }
      ],
      sealed: false
    };

    await ctx.stub.putState(caseId, Buffer.from(JSON.stringify(rec)));
    return JSON.stringify(rec);
  }

  async addEvent(ctx: Context, caseId: string, eventJson: string) {
    const rec = await this._read(ctx, caseId);
    if (rec.sealed) throw new Error("Case is sealed; no more events allowed");

    const ev: CaseEvent = JSON.parse(eventJson);
    ev.timestamp = ev.timestamp || this._txTime(ctx);

    // Append-only
    rec.events.push(ev);

    // Optionally add evidence hashes (append-only)
    if (Array.isArray(ev.evidenceHashes) && ev.evidenceHashes.length) {
      rec.evidenceHashes.push(...ev.evidenceHashes);
    }

    const contentHash = typeof ev.details?.contentHash === "string" ? ev.details.contentHash : "";
    const action = typeof ev.details?.action === "string" ? ev.details.action : ev.type;
    if (contentHash) {
      rec.latestAnchor = {
        contentHash,
        action,
        timestamp: ev.timestamp,
        transactionId: ctx.stub.getTxID(),
        byUid: ev.byUid || "unknown",
        byRole: ev.byRole || "unknown"
      };
    }

    await ctx.stub.putState(caseId, Buffer.from(JSON.stringify(rec)));
    return JSON.stringify(rec);
  }

  async anchorCase(ctx: Context, caseId: string, anchorJson: string) {
    const payload = anchorJson ? JSON.parse(anchorJson) : {};
    const now = this._txTime(ctx);
    const exists = await this._exists(ctx, caseId);
    const txId = ctx.stub.getTxID();
    const byUid = payload.byUid || "unknown";
    const byRole = payload.byRole || "unknown";
    const contentHash = payload.contentHash || "";
    const action = payload.action || "ANCHOR_CASE";

    if (!contentHash) {
      throw new Error("contentHash is required");
    }

    let rec: CaseRecord;
    if (!exists) {
      rec = {
        caseId,
        createdAt: now,
        createdByUid: byUid,
        createdByRole: byRole,
        title: payload.title,
        description: payload.description,
        evidenceHashes: Array.isArray(payload.evidenceHashes) ? payload.evidenceHashes : [],
        events: [],
        sealed: false
      };
    } else {
      rec = await this._read(ctx, caseId);
      if (rec.sealed) throw new Error("Case is sealed; no more events allowed");
    }

    rec.events.push({
      type: action,
      byUid,
      byRole,
      timestamp: now,
      details: {
        action,
        contentHash,
        transactionId: txId
      }
    });

    rec.latestAnchor = {
      contentHash,
      action,
      timestamp: now,
      transactionId: txId,
      byUid,
      byRole
    };

    await ctx.stub.putState(caseId, Buffer.from(JSON.stringify(rec)));
    return JSON.stringify({
      caseId: rec.caseId,
      latestAnchor: rec.latestAnchor,
      sealed: rec.sealed
    });
  }

  async sealCase(ctx: Context, caseId: string, sealedByJson: string) {
    const rec = await this._read(ctx, caseId);
    if (rec.sealed) return JSON.stringify(rec);

    const who = sealedByJson ? JSON.parse(sealedByJson) : {};
    const now = this._txTime(ctx);

    rec.sealed = true;
    rec.sealedAt = now;
    rec.sealedByUid = who.byUid || "unknown";
    rec.sealedByRole = who.byRole || "unknown";
    rec.events.push({
      type: "SEAL_CASE",
      byUid: rec.sealedByUid || "unknown",
      byRole: rec.sealedByRole || "unknown",
      timestamp: now
    });

    await ctx.stub.putState(caseId, Buffer.from(JSON.stringify(rec)));
    return JSON.stringify(rec);
  }

  async readCase(ctx: Context, caseId: string) {
    const rec = await this._read(ctx, caseId);
    return JSON.stringify(rec);
  }

  async getLatestAnchor(ctx: Context, caseId: string) {
    const rec = await this._read(ctx, caseId);
    return JSON.stringify({
      caseId: rec.caseId,
      latestAnchor: rec.latestAnchor || null,
      sealed: rec.sealed
    });
  }

  async _exists(ctx: Context, caseId: string) {
    const data = await ctx.stub.getState(caseId);
    return !!data && data.length > 0;
  }

  async _read(ctx: Context, caseId: string): Promise<CaseRecord> {
    const data = await ctx.stub.getState(caseId);
    if (!data || data.length === 0) throw new Error("Case not found");
    return JSON.parse(data.toString()) as CaseRecord;
  }
}
