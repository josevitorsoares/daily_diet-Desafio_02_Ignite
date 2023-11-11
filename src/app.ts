import fastify from "fastify";
import cookie from "@fastify/cookie";
import { ZodError } from "zod";

import { mealsRoutes } from "./routes/meals";
import { usersRoutes } from "./routes/users";

import { env } from "./env";

export const app = fastify();

app.register(cookie);

app.register(mealsRoutes, {
    prefix: "daily-diet/meals"
});

app.register(usersRoutes, {
    prefix: "daily-diet/users"
});

app.setErrorHandler((error, _, reply)=> {
    if (error instanceof ZodError) {
        return reply.status(400).send({
            message: "Validation Error",
            error: error.format()
        });
    }
    if (env.NODE_ENV === "development") {
        console.error(error);
    } 
    return reply.status(500).send({
        error: "Internal Server Error"
    });
});