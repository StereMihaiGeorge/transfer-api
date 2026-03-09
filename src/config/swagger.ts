import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Nunta Perfecta API",
      version: "1.0.0",
      description: "Wedding planner SaaS API",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Development",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            username: { type: "string" },
            email: { type: "string" },
            plan: { type: "string", enum: ["free", "basic", "premium"] },
          },
        },
        BaseEvent: {
          type: "object",
          properties: {
            id: { type: "integer" },
            user_id: { type: "integer" },
            type: { type: "string", enum: ["wedding", "baptism", "birthday"] },
            title: { type: "string" },
            date: { type: "string", format: "date" },
            venue: { type: "string" },
            city: { type: "string" },
            slug: { type: "string" },
            cover_message: { type: "string" },
          },
        },
        WeddingDetails: {
          type: "object",
          properties: {
            bride_name: { type: "string" },
            groom_name: { type: "string" },
          },
        },
        BaptismDetails: {
          type: "object",
          properties: {
            child_name: { type: "string" },
            child_date_of_birth: { type: "string", format: "date" },
            parent_name: { type: "string" },
            godfather_name: { type: "string" },
            godmother_name: { type: "string" },
            church_name: { type: "string" },
          },
        },
        BirthdayDetails: {
          type: "object",
          properties: {
            person_name: { type: "string" },
            age: { type: "integer" },
            theme: { type: "string" },
            dress_code: { type: "string" },
          },
        },
        Event: {
          allOf: [
            { $ref: "#/components/schemas/BaseEvent" },
            {
              type: "object",
              properties: {
                details: {
                  oneOf: [
                    { $ref: "#/components/schemas/WeddingDetails" },
                    { $ref: "#/components/schemas/BaptismDetails" },
                    { $ref: "#/components/schemas/BirthdayDetails" },
                  ],
                },
              },
            },
          ],
        },
        Guest: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            side: { type: "string", enum: ["bride", "groom", "both"] },
            status: { type: "string", enum: ["pending", "confirmed", "declined"] },
            member_count: { type: "integer" },
            invitation_sent: { type: "boolean" },
            token: { type: "string" },
          },
        },
        Table: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            capacity: { type: "integer" },
            guests_count: { type: "integer" },
            available_spots: { type: "integer" },
          },
        },
        Todo: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            category: { type: "string" },
            status: { type: "string", enum: ["pending", "in_progress", "done"] },
            due_date: { type: "string", format: "date" },
            notes: { type: "string" },
          },
        },
        EventSong: {
          type: "object",
          properties: {
            id: { type: "integer" },
            moment: { type: "string" },
            song_title: { type: "string" },
            artist: { type: "string" },
            notes: { type: "string" },
          },
        },
        SongRequest: {
          type: "object",
          properties: {
            id: { type: "integer" },
            song_title: { type: "string" },
            artist: { type: "string" },
            genre: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
