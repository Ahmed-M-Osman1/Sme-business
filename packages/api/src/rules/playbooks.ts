import type {Customer} from '@shory/db';
import type {PlaybookResult} from '@shory/shared';

function renewalHighConfidence(customer: Customer): PlaybookResult {
  return {
    type: 'renewal_high_confidence',
    urgency: 'low',
    badge: '🟢 Renewal Opportunity',
    headline: `${customer.company} — High-confidence renewal`,
    body: `${customer.name} at ${customer.company} has an NPS of ${customer.nps ?? 'N/A'} and renews in ${customer.renewalDays} days. Low churn risk — focus on upsell during renewal conversation. Premium: AED ${customer.premium}.`,
    actions: [
      'send_renewal_reminder',
      'schedule_call',
      'prepare_upsell_proposal',
    ],
    inboundGuide: {
      title: 'Renewal Conversation Guide',
      points: [
        `Acknowledge loyalty — ${customer.company} is a valued customer`,
        'Highlight any new products or coverage enhancements available',
        `Review current coverage gaps: ${customer.missingProducts.length > 0 ? customer.missingProducts.join(', ') : 'none identified'}`,
        'Offer multi-year lock-in discount if appropriate',
      ],
      contextNote: `NPS ${customer.nps ?? 'N/A'} | ${customer.renewalDays} days to renewal | ${customer.products.length} active products`,
    },
  };
}

function churnHighRisk(customer: Customer): PlaybookResult {
  return {
    type: 'churn_high_risk',
    urgency: 'critical',
    badge: '🔴 Churn Risk — High',
    headline: `${customer.company} — Urgent churn intervention needed`,
    body: `${customer.name} at ${customer.company} renews in ${customer.renewalDays} days with a churn score of ${customer.churnScore}. ${customer.claimsOpen > 0 ? `${customer.claimsOpen} open claim(s) contributing to risk.` : ''} ${customer.paymentStatus === 'overdue' ? 'Payment is overdue.' : ''} Immediate action required.`,
    actions: [
      'send_retention_email',
      'apply_discount',
      'schedule_urgent_call',
      'escalate_to_manager',
    ],
    inboundGuide: {
      title: 'Churn Prevention — Inbound Guide',
      points: [
        'Lead with empathy — acknowledge any service issues',
        `${customer.claimsOpen > 0 ? `Address ${customer.claimsOpen} open claim(s) first — this is likely driving dissatisfaction` : 'Check if there are any unresolved concerns'}`,
        `${customer.paymentStatus === 'overdue' ? 'Discuss flexible payment options — overdue balance is a risk factor' : 'Confirm payment status is healthy'}`,
        'Offer loyalty discount or enhanced coverage at current price',
        'Confirm next steps and follow-up date before ending call',
      ],
      contextNote: `Churn score ${customer.churnScore} | ${customer.renewalDays} days to renewal | NPS ${customer.nps ?? 'N/A'} | Payment: ${customer.paymentStatus}`,
    },
  };
}

function upsellOpportunity(customer: Customer): PlaybookResult {
  return {
    type: 'upsell_opportunity',
    urgency: 'medium',
    badge: '🟡 Revenue Opportunity',
    headline: `${customer.company} — Upsell potential identified`,
    body: `${customer.name} at ${customer.company} is active with ${customer.products.length} product(s) but missing ${customer.missingProducts.length} coverage type(s): ${customer.missingProducts.join(', ')}. Revenue opportunity: AED ${customer.revenueOpp}. Renewal is ${customer.renewalDays} days away — good window for engagement.`,
    actions: [
      'send_email',
      'prepare_upsell_proposal',
      'schedule_call',
    ],
    inboundGuide: {
      title: 'Upsell Conversation Guide',
      points: [
        `Current coverage: ${customer.products.join(', ')}`,
        `Missing products: ${customer.missingProducts.join(', ')}`,
        'Position additional coverage as risk mitigation, not just cost',
        `Estimated revenue opportunity: AED ${customer.revenueOpp}`,
        'Offer bundled pricing if customer adds 2+ products',
      ],
      contextNote: `${customer.products.length} products | ${customer.missingProducts.length} gaps | AED ${customer.revenueOpp} opportunity | ${customer.employees} employees`,
    },
  };
}

function complianceCritical(customer: Customer): PlaybookResult {
  return {
    type: 'compliance_critical',
    urgency: 'critical',
    badge: '⚫ Compliance — Lapsed',
    headline: `${customer.company} — Lapsed policy, compliance risk`,
    body: `${customer.name} at ${customer.company} has been lapsed for ${Math.abs(customer.renewalDays)} days. This creates compliance exposure for the customer and potential regulatory risk. Automated re-engagement sequences may have been exhausted — manual outreach required.`,
    actions: [
      'send_compliance_notice',
      'schedule_urgent_call',
      'escalate_to_manager',
      'send_whatsapp',
    ],
    inboundGuide: {
      title: 'Compliance Recovery Guide',
      points: [
        'Inform customer of lapsed status and compliance implications',
        'Offer immediate reinstatement with simplified process',
        'Discuss any barriers to renewal — cost, service, coverage fit',
        'If cost is an issue, explore reduced coverage options to maintain compliance',
        'Set hard deadline for response before regulatory escalation',
      ],
      contextNote: `Lapsed ${Math.abs(customer.renewalDays)} days | Last contact: ${customer.lastContact ? customer.lastContact.toLocaleDateString() : 'unknown'} | Auto-comms: ${customer.autoCommsStatus ?? 'none'}`,
    },
  };
}

export function resolvePlaybook(customer: Customer): PlaybookResult {
  // Priority order: compliance > churn > renewal > upsell
  if (customer.stage === 'lapsed' && customer.renewalDays < -30) {
    return complianceCritical(customer);
  }
  if (customer.renewalDays <= 7 && customer.churnScore >= 50) {
    return churnHighRisk(customer);
  }
  if (
    customer.renewalDays > 0 &&
    customer.renewalDays <= 60 &&
    customer.churnScore < 30 &&
    customer.nps !== null &&
    customer.nps >= 8
  ) {
    return renewalHighConfidence(customer);
  }
  if (
    customer.stage === 'active' &&
    customer.missingProducts.length > 0 &&
    customer.renewalDays > 60
  ) {
    return upsellOpportunity(customer);
  }

  // Default fallback — general engagement
  return {
    type: 'general_engagement',
    urgency: 'low',
    badge: '⚪ General',
    headline: `${customer.company} — No specific playbook triggered`,
    body: `${customer.name} at ${customer.company} does not match any high-priority playbook criteria. Monitor for changes in churn score, renewal timeline, or coverage gaps.`,
    actions: ['schedule_call', 'send_email'],
    inboundGuide: {
      title: 'General Engagement Guide',
      points: [
        'Check in on overall satisfaction',
        'Review coverage adequacy',
        'Mention any new products or promotions',
      ],
      contextNote: `Churn ${customer.churnScore} | Health ${customer.healthScore} | ${customer.renewalDays} days to renewal`,
    },
  };
}
