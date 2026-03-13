
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
};

export class CaseFlowContract extends Contract {

  async createCase(ctx: Context, caseId: string, payloadJson: string) {
    const exists = await this._exists(ctx, caseId);
    if (exists) throw new Error("Case already exists");

    const payload = payloadJson ? JSON.parse(payloadJson) : {};
    const now = new Date().toISOString();

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
    ev.timestamp = ev.timestamp || new Date().toISOString();

    // Append-only
    rec.events.push(ev);

    // Optionally add evidence hashes (append-only)
    if (Array.isArray(ev.evidenceHashes) && ev.evidenceHashes.length) {
      rec.evidenceHashes.push(...ev.evidenceHashes);
    }

    await ctx.stub.putState(caseId, Buffer.from(JSON.stringify(rec)));
    return JSON.stringify(rec);
  }

  async sealCase(ctx: Context, caseId: string, sealedByJson: string) {
    const rec = await this._read(ctx, caseId);
    if (rec.sealed) return JSON.stringify(rec);

    const who = sealedByJson ? JSON.parse(sealedByJson) : {};
    const now = new Date().toISOString();

    rec.sealed = true;
    rec.sealedAt = now;
    rec.sealedByUid = who.byUid || "unknown";
    rec.sealedByRole = who.byRole || "unknown";
    rec.events.push({
      type: "SEAL_CASE",
      byUid: rec.sealedByUid,
      byRole: rec.sealedByRole,
      timestamp: now
    });

    await ctx.stub.putState(caseId, Buffer.from(JSON.stringify(rec)));
    return JSON.stringify(rec);
  }

  async readCase(ctx: Context, caseId: string) {
    const rec = await this._read(ctx, caseId);
    return JSON.stringify(rec);
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
