export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  port: parseInt(process.env.PORT ?? '3000', 10),
  saltRounds: parseInt(process.env.SALT_ROUNDS ?? '10', 10),
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
});
