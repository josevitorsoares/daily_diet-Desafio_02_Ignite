import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";
import { checkSessionIDExists } from "../middlewares/checkSessionIDExists";

type IMeals = {
    name: string;
    description: string;
    dateTime: Date;
    inDiet: boolean;
}

type SequecenceMeal = IMeals[];

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

        const allMeals = await knex("meals").
            where("FK_user_id", sessionId)
            .select("*");
        
        let totalMelas: number = 0;
        let melasInDiet: number = 0;
        let mealsOutDiet: number = 0;

        let sequence: SequecenceMeal = [];
        let bestSequence: number = 0;

        allMeals.map((meal) => {
            totalMelas += 1;
            if (meal.inDiet === 1) {
                melasInDiet += 1;
                sequence.push(meal);
            } else {
                mealsOutDiet += 1;
                if (sequence.length > 0) {
                    if (sequence.length > bestSequence) {
                        bestSequence = sequence.length;
                    }
                    sequence = [];
                }
            }
        });

        return {
            totalMelas,
            melasInDiet,
            mealsOutDiet,
            bestSequence
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