# Shopify subscriptions: authorization and launch checklist

Connected shop: k0yrr9-zr.myshopify.com (EUR). Existing Starter, Professional and Enterprise products remain DRAFT. Do not recreate them or activate checkout before launch approval.

## Verified access (2 November 2026)

The connected app has write_products but lacks read_customer_payment_methods, read_own_subscription_contracts and write_own_subscription_contracts. The sellingPlanGroups query returned no groups owned by this app. Shopify subscription selling-plan creation is blocked until an eligible app obtains the required authorization.

## Next steps

1. In Shopify Dev Dashboard (https://dev.shopify.com/), create or select an eligible subscription app. Admin-created custom apps cannot request the protected subscription scopes.
2. Request subscription API access for recurring software subscriptions, including renewals, failed payments, cancellations and customer entitlement management.
3. Once approved, grant write_products, read_customer_payment_methods, read_own_subscription_contracts and write_own_subscription_contracts. Reinstall or update app permissions as needed.
4. Configure monthly selling plans for the existing Starter (EUR 19), Professional (EUR 59), Enterprise (EUR 199) draft products. Verify variant IDs and selling-plan IDs.
5. Deploy trusted backend with TLS, secret management, persistent webhook replay protection, customer identity binding, contract and payment verification, and entitlement reconciliation.
6. Test subscription creation, renewals, failed payments, cancellation and webhook retries. Obtain explicit administrator approval before publishing or enabling payments.

The proposed annual discount is not a Shopify billing configuration. Do not advertise it as active. Never store Shopify API credentials in the public repository.

The subscription-readiness.mjs module evaluates prerequisites and fails closed.
