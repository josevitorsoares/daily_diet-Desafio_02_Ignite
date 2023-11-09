import {knex as setupKnex, Knex} from "knex";
import { env } from "./env";

export const configs: Knex.Config = {
    client: env.DATABASE_CLIENT,
    connection: {
        filename: env.DATABASE_URL
    },
    useNullAsDefault: true,
    migrations: {
        extension: "ts",
        directory: "./database/migrations"
    }
};

export const knex = setupKnex(configs);