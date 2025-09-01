exports.onExecutePostLogin = async (event, api) => {
  const NS = 'https://heliotropeimaginal.com/claims';
  const roles = event.authorization?.roles || [];
  const am = event.user.app_metadata || {};
  const iface = am.interface === 'professional' ? 'professional' : 'student';
  const flags = am.flags || {};
  api.idToken.setCustomClaim(`${NS}/roles`, roles);
  api.idToken.setCustomClaim(`${NS}/interface`, iface);
  api.idToken.setCustomClaim(`${NS}/flags`, {
    beta: !!flags.beta,
    test: !!flags.test
  });
};
