['TENANT_DOMAIN','MGMT_AUDIENCE','MGMT_CLIENT_ID','MGMT_CLIENT_SECRET'].forEach((k) => {
  if (!process.env[k]) console.warn(`Missing env var ${k}`);
});
