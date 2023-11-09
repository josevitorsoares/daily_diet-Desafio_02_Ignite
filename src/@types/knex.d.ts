declare module "knex/types/tables" {
    export interface Tables {
        users: {
            id: string,
            name: string,
            created_at: string
        },
        meals : {
            id: string,
            name: string,
            description: string,
            dateTime: string,
            inDiet: boolean,
            created_at: string,
            FK_user_id: string
        }
    }
}