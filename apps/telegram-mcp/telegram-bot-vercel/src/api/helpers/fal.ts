const FAL_KEY = process.env.FAL_KEY;

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Generate an image using FAL.ai
 */
export async function generateImage(prompt: string): Promise<ImageGenerationResult> {
  if (!FAL_KEY) {
    return { success: false, error: "FAL API key not configured" };
  }

  try {
    console.log(`[FAL] Generating image for prompt: "${prompt.substring(0, 50)}..."`);

    // Use fal-ai/flux/schnell for fast generation
    const response = await fetch("https://fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        image_size: "landscape_16_9",
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[FAL] API error: ${response.status} - ${errorText}`);
      return { success: false, error: `FAL API error: ${response.status}` };
    }

    const result = await response.json();

    if (result.images && result.images.length > 0) {
      const imageUrl = result.images[0].url;
      console.log(`[FAL] Image generated successfully: ${imageUrl}`);
      return { success: true, imageUrl };
    }

    return { success: false, error: "No image generated" };
  } catch (error: any) {
    console.error(`[FAL] Error generating image:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Generate an image using FLUX Pro for higher quality
 */
export async function generateImagePro(prompt: string): Promise<ImageGenerationResult> {
  if (!FAL_KEY) {
    return { success: false, error: "FAL API key not configured" };
  }

  try {
    console.log(`[FAL PRO] Generating high-quality image for: "${prompt.substring(0, 50)}..."`);

    const response = await fetch("https://fal.run/fal-ai/flux-pro", {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        image_size: "landscape_16_9",
        num_images: 1,
        enable_safety_checker: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[FAL PRO] API error: ${response.status} - ${errorText}`);
      return { success: false, error: `FAL API error: ${response.status}` };
    }

    const result = await response.json();

    if (result.images && result.images.length > 0) {
      const imageUrl = result.images[0].url;
      console.log(`[FAL PRO] Image generated successfully: ${imageUrl}`);
      return { success: true, imageUrl };
    }

    return { success: false, error: "No image generated" };
  } catch (error: any) {
    console.error(`[FAL PRO] Error generating image:`, error.message);
    return { success: false, error: error.message };
  }
}
