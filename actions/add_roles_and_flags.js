exports.onExecutePostLogin = async (event, api) => {
  const roles = event.authorization?.roles || [];
  const am = event.user.app_metadata || {};
  const flags = am.flags || {};

  // SelfActual namespace — used by Atlas, gateway, and SelfActual apps
  const SA = 'https://selfactual.ai/claims';
  api.idToken.setCustomClaim(`${SA}/roles`, roles);
  api.accessToken.setCustomClaim(`${SA}/roles`, roles);

  // Heliotrope namespace — used by HI apps
  const HI = 'https://heliotropeimaginal.com/claims';
  const iface = am.interface === 'professional' ? 'professional' : 'student';
  api.idToken.setCustomClaim(`${HI}/roles`, roles);
  api.idToken.setCustomClaim(`${HI}/interface`, iface);
  api.idToken.setCustomClaim(`${HI}/flags`, {
    beta: !!flags.beta,
    test: !!flags.test
  });
};
