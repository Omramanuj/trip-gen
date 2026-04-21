import { healthPayload } from './_openrouter.js';

export default function handler(_req, res) {
  res.status(200).json(healthPayload());
}
