import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  STRIPE_SECRET: string;
  STRIPE_WEBHOOK_SIGNING_SECRET: string;
}

const envSchema = joi.object<EnvVars>({
  PORT: joi.number().required(),
  STRIPE_SECRET: joi.string().required(),
  STRIPE_WEBHOOK_SIGNING_SECRET: joi.string().required(),
});

function validateEnv<T>(
  schema: joi.ObjectSchema<T>,
  env: NodeJS.ProcessEnv,
): T {
  const result = schema.validate(env, {
    allowUnknown: true,
    convert: true,
  });

  if (result.error)
    throw new Error(`Config validation error: ${result.error.message}`);

  return result.value;
}

const validatedEnv = validateEnv(envSchema, process.env);

export const envs = {
  port: validatedEnv.PORT,
  stripe: {
    secret: validatedEnv.STRIPE_SECRET,
    webhook: {
      signingSecret: validatedEnv.STRIPE_WEBHOOK_SIGNING_SECRET,
    },
  },
};
