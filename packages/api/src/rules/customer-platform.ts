import type {Customer, ApiService} from '@shory/db';
import type {CustomerPlatformContext} from '@shory/shared';

/**
 * Maps insurer IDs to their corresponding API service IDs.
 */
const INSURER_SERVICE_MAP: Record<string, string> = {
  orient: 'orient',
  gig: 'gig',
  rsa: 'rsa',
  sukoon: 'sukoon',
  noor: 'noor',
};

export function getCustomerPlatformContext(
  customer: Customer,
  services: ApiService[],
): CustomerPlatformContext {
  const degradedServices = services.filter(
    (s) => s.status === 'degraded' || s.status === 'down',
  );

  // Check if payment service is degraded and customer has pending/overdue payment
  const paymentService = degradedServices.find((s) => s.id === 'payment');
  if (
    paymentService &&
    (customer.paymentStatus === 'pending' ||
      customer.paymentStatus === 'overdue')
  ) {
    return {
      flag: true,
      issue: 'Payment service degradation affecting this customer',
      detail: `Payment gateway is ${paymentService.status} (error rate: ${Number(paymentService.errorRate).toFixed(1)}%). ${customer.name} has a ${customer.paymentStatus} payment that may be impacted.`,
      severity: 'high',
    };
  }

  // Check if customer's insurer API is degraded
  if (customer.insurerId) {
    const insurerServiceId = INSURER_SERVICE_MAP[customer.insurerId];
    if (insurerServiceId) {
      const degradedInsurer = degradedServices.find(
        (s) => s.id === insurerServiceId,
      );
      if (degradedInsurer) {
        const errorRate = Number(degradedInsurer.errorRate);
        const severity: 'low' | 'medium' | 'high' =
          errorRate > 5 ? 'high' : errorRate > 2 ? 'medium' : 'low';

        return {
          flag: true,
          issue: `${degradedInsurer.name} API degradation`,
          detail: `${degradedInsurer.name} is ${degradedInsurer.status} (error rate: ${errorRate.toFixed(1)}%). This may affect policy operations for ${customer.company}.`,
          severity,
        };
      }
    }
  }

  return {
    flag: false,
    issue: null,
    detail: null,
    severity: null,
  };
}
