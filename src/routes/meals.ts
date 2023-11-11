import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";
import { checkSessionIDExists } from "../middlewares/checkSessionIDExists";

export async function mealsRoutes(app: FastifyInstance) {
    app.get("/", { preHandler: [checkSessionIDExists] }, async (request) => {
        const { sessionId } = request.cookies;

        const meals = await knex("meals")
            .where("FK_user_id", sessionId)
            .select();

        return { meals };
    });

    app.get("/:id", { preHandler: [checkSessionIDExists] }, async (request) => {
        const getMealsParamsResponse = z.object({
            id: z.string().uuid()
        });

        const { id } = getMealsParamsResponse.parse(request.params);

        const { sessionId } = request.cookies;

        const meal = await knex("meals")
            .where({
                id,
                FK_user_id: sessionId
            })
            .first();

        return { meal };
    });

    app.get("/statistics", { preHandler: [checkSessionIDExists] }, async (request) => {
        const { sessionId } = request.cookies;

        const totalMelas = await knex("meals")
            .where("FK_user_id", sessionId)
            .count("id", {as: "total"})
            .first();
        
        const melasInDiet = await knex("meals")
            .where({
                FK_user_id: sessionId,
                inDiet: true
            })
            .count("id", {as: "total"})
            .first();
        
        const mealsOutDiet = await knex("meals")
            .where({
                FK_user_id: sessionId,
                inDiet: false
            })
            .count("id", {as: "total"})
            .first();

        return {
            totalMelas,
            melasInDiet,
            mealsOutDiet,
        };
    });

    app.post("/", { preHandler: [checkSessionIDExists] }, async (request, reply) => {
        const createMealsBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            dateTime: z.string().datetime("2022-01-12T00:00:00.000Z"),
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

    app.put("/:id", { preHandler: [checkSessionIDExists] }, async (request) => {
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

    app.delete("/:id", {preHandler: [checkSessionIDExists]}, async (request) => {
        const getMealsParamsResponse = z.object({
            id: z.string().uuid()
        });

        const { id } = getMealsParamsResponse.parse(request.params);
        const { sessionId } = request.cookies;

        await knex("meals")
            .where({
                id,
                FK_user_id: sessionId
            })
            .del();
    });
}