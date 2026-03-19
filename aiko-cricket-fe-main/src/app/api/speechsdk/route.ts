import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("speech-token")?.value?.split(":")[0];
  const speechKey = process.env.SPEECH_KEY || "";
  const speechRegion = process.env.SPEECH_REGION || "";
  const expiration = new Date(Date.now() + 5 * 60 * 1000); // set expiration to 5 minutes from now
  if (!token) {
    try {
      const res = await fetch(
        `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Ocp-Apim-Subscription-Key": speechKey,
          },
        }
      );

      if (!res.ok) {
        const error = await res.json();
        return Response.json(error, { status: res.status || 401 });
      }

      const tokenValue: string = await res.text();
      const resBody = {
        token: tokenValue,
        region: speechRegion,
      };
      return Response.json(resBody, {
        headers: {
          "Set-Cookie": `speech-token=${tokenValue}:${speechRegion}; Expires=${expiration.toUTCString()}`,
        },
        status: 200,
      });
    } catch (e) {
      console.error(e);
      return new Response(`Internal Server Error - ${e}`, {
        status: 401,
      });
    }
  }

  return Response.json(
    { token, region: speechRegion },
    {
      headers: {
        "Set-Cookie": `speech-token=${token}:${speechRegion}; Expires=${expiration.toUTCString()}`,
      },
      status: 200,
    }
  );
}