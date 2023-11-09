import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";
import { checkSessionIDExists } from "../middlewares/checkSessionIDExists";

export async function mealsRoutes(app: FastifyInstance) {
    app.get("/", {preHandler: [checkSessionIDExists]}, async (request) => {
        const { sessionId } = request.cookies;

        const meals = await knex("meals")
            .where("FK_user_id", sessionId)
            .select();

        return { meals };
    });

    app.post("/", {preHandler: [checkSessionIDExists]}, async (request, reply) => {
        const createMealsBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            dateTime: z.string(),
            inDiet: z.boolean()
        });

        const { name, description, dateTime, inDiet } = createMealsBodySchema.parse(request.body);
        const user_id = request.cookies.sessionId;

        await knex("meals").insert({
            id: randomUUID(),
            name,
            description,
            dateTime,
            inDiet,
            FK_user_id: user_id
        });

        reply.status(201).send();
    });

    app.post("/:id", {preHandler: [checkSessionIDExists]},async (request) => {
        const getMealsParamsResponse = z.object({
            id: z.string().uuid()
        });

        const { id } = getMealsParamsResponse.parse(request.params);

        const createMealsBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            dateTime: z.string(),
            inDiet: z.boolean(),
        });

        const { name, description, dateTime, inDiet } = createMealsBodySchema.parse(request.body);

        const meal = await knex("meals")
            .where("id", id)
            .update({
                name,
                description,
                dateTime,
                inDiet
            }).returning("*");

        return { meal };
    });
}