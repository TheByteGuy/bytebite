#Store tiny jsons for the current day so we don't need to remake them each time

User info
    Username, Password (hash)
    allergies
    preferences
        Vegan or not vegan
        another piece of text they can input (will be sent to gemini( Ex: "I hate vegetables"
    exercise habits
    gender
    age
    Last meal plan we gave them, so we don't send duplicate prompts to gemini. Ex: save the response so if they go to the site twice we can display the old meal plan