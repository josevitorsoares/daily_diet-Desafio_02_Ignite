import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("meals", (table) => {
        table.uuid("id").primary();
        table.string("name").notNullable();
        table.string("description").notNullable();
        table.timestamp("dateTime").notNullable();
        table.boolean("inDiet").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.uuid("FK_user_id").unsigned();
        table.foreign("FK_user_id").references("id")
            .inTable("users")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("meals");
}

