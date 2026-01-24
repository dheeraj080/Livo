import dotenv from "dotenv"
dotenv.config()

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

const ratelimit = new Ratelimit({
  redis, // pass the instance, not the function
  limiter: Ratelimit.slidingWindow(40, "60 s"),
  // optional:
  // analytics: true,
  // prefix: "@upstash/ratelimit",
})

export default ratelimit
