import { CorporateProposal, ProposalStatus } from '@/types/database';

export interface CreateCorporateProposalInput {
  company_name: string;
  gstin?: string;
  pan_number?: string;
  billing_address?: string;
  booker_name: string;
  booker_email: string;
  booker_phone: string;
  tour_id?: string;
  tour_title: string;
  proposed_date: string; // ISO string
  group_size: number;
  custom_price_per_pax: number;
  payment_terms_days?: number; // default 15 days
  po_number?: string;
  special_requirements?: string;
}

export class CorporateProposalBuilder {
  private static proposals: CorporateProposal[] = [];

  /**
   * Build a formal B2B proposal with 18% GST and guide cohort allocation
   */
  static createProposal(input: CreateCorporateProposalInput): {
    proposal: CorporateProposal;
    guideCohortsCount: number;
    recommendedGuides: number;
    gstBreakdown: {
      subtotal: number;
      cgst: number;
      sgst: number;
      grandTotal: number;
    };
  } {
    const groupSize = Math.max(1, input.group_size);
    const subtotal = groupSize * input.custom_price_per_pax;
    const gstRate = 0.18; // 18% GST for Corporate B2B (SAC 998554)
    const gstTax = Math.round(subtotal * gstRate);
    const halfGst = Math.round(gstTax / 2);
    const grandTotal = subtotal + gstTax;

    // Khaki operational rule: Max 20 guests per Ambassador to maintain intimacy
    const recommendedGuides = Math.ceil(groupSize / 20);

    const refNumber = `KT-CORP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const validityDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const proposal: CorporateProposal = {
      id: `prop_${Date.now()}`,
      proposal_reference: refNumber,
      organization_id: `org_${Date.now()}`,
      contact_id: `cnt_${Date.now()}`,
      tour_id: input.tour_id || null,
      proposed_date: input.proposed_date,
      group_size: groupSize,
      custom_price_per_pax: input.custom_price_per_pax,
      subtotal_amount_inr: subtotal,
      gst_scheme: 'STANDARD_18_PERCENT',
      gst_rate_percent: 18.0,
      gst_tax_amount_inr: gstTax,
      grand_total_inr: grandTotal,
      validity_date: validityDate,
      status: 'SENT',
      special_briefing_notes: input.special_requirements || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.proposals.unshift(proposal);

    return {
      proposal,
      guideCohortsCount: recommendedGuides,
      recommendedGuides,
      gstBreakdown: {
        subtotal,
        cgst: halfGst,
        sgst: halfGst,
        grandTotal,
      },
    };
  }

  /**
   * Retrieve active corporate proposals
   */
  static listProposals(): CorporateProposal[] {
    return this.proposals;
  }

  /**
   * Update proposal status
   */
  static updateStatus(proposalId: string, status: ProposalStatus): boolean {
    const p = this.proposals.find((item) => item.id === proposalId || item.proposal_reference === proposalId);
    if (!p) return false;
    p.status = status;
    p.updated_at = new Date().toISOString();
    return true;
  }
}
