#Code for the ai powered search bar using the OPEN_AI_API_KEY in dotenv (.env) file

import os
from openai import OpenAI
from dotenv import load_dotenv, dotenv_values

#Get the API key formt he environemnta variables

load_dotenv()  # Load environment variables from .env file

api_key = os.getenv("OPENAI_API_KEY")

#Initialize the OpenAI client
client = OpenAI(api_key=api_key)

#Make a request- will need to have a placeholder for the actual users request

response = client.responses.create(
    model = "gpt-4o-mini",
    instructions="Talk like a 5th grade teacher who studies marine biology at the Phd level.",
    input = "What do i do when red tide happens?"
)

print(response.output_text)






