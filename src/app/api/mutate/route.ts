import { NextResponse } from 'next/server';
import { sanityClient } from '@/sanity/client';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      vesselName,
      imoNumber,
      transitZoneId = 'zone-bab-el-mandeb',
      adjudicatedAction = 'GO_DARK_AUTHORIZED',
      statutoryDefenseClause = 'SOLAS Regulation XI-2/8 (Master Overriding Authority for Human Life Preservation)',
      insuranceWarrantyWaiverCode = 'LLOYDS-EMERGENCY-WAIVER-CTF153-902',
      authorizingDirector = 'Capt. Henrik Lindqvist (Global Maritime Security Director)',
      rationale = 'Active kinetic drone targeting confirmed. Master override executed concurrently with pre-cleared CTF-153 tactical dark transit protocol.',
    } = body;

    const decisionId = `ADJ-2026-MUT-${Date.now().toString().slice(-4)}`;
    const timestamp = new Date().toISOString();

    // Compute cryptographic audit signature
    const signaturePayload = `${decisionId}|${vesselName}|${imoNumber}|${adjudicatedAction}|${insuranceWarrantyWaiverCode}|${timestamp}`;
    const digitalSignatureHash = crypto.createHash('sha256').update(signaturePayload).digest('hex');

    // Execute Sanity Content Lake Mutation
    const persistedDocument = await sanityClient.create({
      _type: 'adjudicatedDecision',
      decisionId,
      vesselName: vesselName || 'MV Nordic Sentinel',
      imoNumber: imoNumber || 'IMO-9845210',
      transitZoneId,
      contradictionSignature: 'SOLAS_V19_VS_UKMTO_VS_LLOYDS_JWLA032',
      adjudicatedAction,
      statutoryDefenseClause,
      insuranceWarrantyWaiverCode,
      authorizingDirector,
      digitalSignatureHash,
      adjudicatedAt: timestamp,
      carriesAcrossFutureBuilds: true,
      rationale,
    });

    return NextResponse.json({
      success: true,
      message: 'Decision persisted to Sanity Content Lake. All future agent builds and fleet queries will inherit this adjudication.',
      decision: persistedDocument,
      mutationPayload: {
        operation: 'sanityClient.create()',
        targetDataset: sanityClient.dataset,
        projectId: sanityClient.projectId,
        documentId: persistedDocument._id,
        digitalSignatureHash,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
