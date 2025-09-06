import path from 'node:path'
import * as dotenv from 'dotenv'


dotenv.config({ path: path.join("./src/config/.env.dev") })

import bootStrap from "./app.controller.js";



bootStrap();