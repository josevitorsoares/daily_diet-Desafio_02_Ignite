import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";

export async function usersRoutes(app: FastifyInstance) {
    app.post("/", async (request, reply) => {
        const createUserBodySchema = z.object({
            name: z.string(),
            email: z.string()
        });

        const { name, email } = createUserBodySchema.parse(request.body);
        const id = randomUUID();

        let sessionId = request.cookies.sessionId;
        sessionId = id;

        reply.cookie("sessionId", sessionId, {
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dias em milisegundos
        });

        await knex("users").insert({
            id,
            name,
            email
        });

        reply.status(201).send();
    });
}