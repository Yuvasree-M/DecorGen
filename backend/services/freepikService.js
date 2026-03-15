import axios from "axios";

const FREEPIK_KEY = process.env.FREEPIK_API_KEY;

export const generateRoomDesign = async (prompt, imageUrl) => {
  const task = await axios.post(
    "https://api.freepik.com/v1/ai/text-to-image/flux-kontext-pro",
    { prompt, input_image: imageUrl, strength: 0.45 },
    { headers: { "Content-Type": "application/json", "x-freepik-api-key": FREEPIK_KEY } }
  );

  const taskId = task.data.data.task_id;
  let status = "IN_PROGRESS";
  let result;

  while (status === "IN_PROGRESS" || status === "CREATED") {
    await new Promise(r => setTimeout(r, 4000));
    const check = await axios.get(
      `https://api.freepik.com/v1/ai/text-to-image/flux-kontext-pro/${taskId}`,
      { headers: { "x-freepik-api-key": FREEPIK_KEY } }
    );
    status = check.data.data.status;
    result = check.data;
  }

  const generated = result.data.generated;
  return generated[0].image?.url || generated[0].url || generated[0];
};
