import { GoogleGenAI, Type, Modality } from '@google/genai';
import { ImageConfig, MovieCharacter, MovieScene, RCCrawlerCharacter, RCCrawlerScene, ShotType, ASMRCharacter, ASMRScene } from '../types';

let ai: GoogleGenAI | null = null;

export const initializeAiClient = (apiKey: string) => {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
};

const checkClient = () => {
    if (!ai) {
        throw new Error('API client not initialized. Please set your API key in settings.');
    }
};

export const generateImage = async (prompt: string, config: ImageConfig): Promise<string[]> => {
    checkClient();
    const response = await ai!.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
            numberOfImages: config.numberOfImages,
            outputMimeType: 'image/png',
            aspectRatio: config.aspectRatio,
        },
    });

    return response.generatedImages.map(img => img.image.imageBytes);
};


export const generateVideo = async (prompt: string, imageBase64: string | null) => {
    checkClient();
    const requestPayload: any = {
        model: 'veo-2.0-generate-001',
        prompt,
        config: {
            numberOfVideos: 1,
        }
    };

    if (imageBase64) {
        requestPayload.image = {
            imageBytes: imageBase64,
            mimeType: 'image/png',
        };
    }
    
    const operation = await ai!.models.generateVideos(requestPayload);
    return operation;
};

export type VideosOperation = Awaited<ReturnType<typeof generateVideo>>;

export const pollVideoStatus = async (operation: VideosOperation): Promise<VideosOperation> => {
    checkClient();
    const updatedOperation = await ai!.operations.getVideosOperation({ operation });
    return updatedOperation;
};


export const fetchVideoBlob = async (uri: string, apiKey: string): Promise<Blob> => {
    if (!apiKey) {
        throw new Error('API key is required to fetch video.');
    }
    const response = await fetch(`${uri}&key=${apiKey}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`);
    }
    return response.blob();
};

export const enhancePrompt = async (prompt: string): Promise<string> => {
    checkClient();
    try {
        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Rewrite and expand this simple user prompt into a highly detailed and descriptive prompt for an AI image generator. Make it cinematic, visually rich, and full of evocative details. User prompt: "${prompt}"`,
            config: {
                systemInstruction: "You are a creative assistant that rewrites simple user prompts into vivid, detailed, and professional prompts for an AI image generator. Do not add any preamble or explanation, just output the enhanced prompt text directly."
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error enhancing prompt:", error);
        throw new Error('Failed to enhance prompt. Please check your API key and network connection.');
    }
};

export const enhanceImage = async (imageBase64: string, rejectionReasons: string[]): Promise<string> => {
    checkClient();

    let enhancementPrompt = "Act as a professional photo editor. Enhance this image for professional stock photography. Improve overall resolution, color balance, and details to make it look high-quality and commercially appealing. Do not add or remove any objects from the scene.";
    if (rejectionReasons.length > 0) {
        enhancementPrompt += ` Specifically, focus on correcting the following issues: ${rejectionReasons.join(', ')}.`;
    }

    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64,
            },
        };
        const textPart = {
            text: enhancementPrompt,
        };

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        
        throw new Error('No image was returned from the enhancement process.');

    } catch (error) {
        console.error("Error enhancing image:", error);
        throw error;
    }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    checkClient();
    try {
        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate the following text to ${targetLanguage}: "${text}"`,
             config: {
                systemInstruction: `You are a professional translator. You will be given text and a target language. Translate the text accurately to the target language. Do not add any preamble, explanation, or quotation marks. Output only the translated text directly.`
            }
        });
        return response.text.trim();
    } catch(error) {
        console.error("Error translating text:", error);
        throw new Error('Translation failed. The API may be unavailable.');
    }
};

export const correctText = async (text: string): Promise<string> => {
    checkClient();
    try {
        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Correct the spelling and grammar of the following text: "${text}"`,
             config: {
                systemInstruction: `You are a professional editor. You will be given text to correct for spelling and grammar. Only output the corrected text. Do not add any preamble, explanation, or quotation marks.`
            }
        });
        return response.text.trim();
    } catch(error) {
        console.error("Error correcting text:", error);
        throw new Error('Text correction failed. The API may be unavailable.');
    }
}

export const generateSpeech = async (text: string, voices: {name: string, lang: string, isLocal: boolean}[]): Promise<string> => {
    checkClient();
    const voiceList = JSON.stringify(voices);
    const prompt = `You are an expert voice casting director. Your task is to select the best voice for reading the provided text aloud from a given list of voices.

Voices marked with "isLocal: false" are high-quality, cloud-based voices and should be strongly preferred if their language and style fit the text.

Text to be read:
"${text}"

Available voices:
${voiceList}

Based on the text and the available voices, which voice is the best fit? Respond with ONLY the exact "name" of the chosen voice from the list provided. Do not add any explanation or punctuation.`;

    try {
        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch(error) {
        console.error("Error suggesting voice:", error);
        throw new Error('AI voice suggestion failed.');
    }
};

export const gradeImage = async (imageBase64: string): Promise<{ acceptanceProbability: number; feedback: string; rejectionReasons: string[] }> => {
    checkClient();
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
        },
    };
    const textPart = {
        text: "Act as an expert stock photography reviewer. Analyze this image based on technical quality (focus, noise, lighting) and commercial viability. Provide a probability of acceptance for a major stock photo site like Adobe Stock or Getty Images. Also provide concise feedback and a list of specific rejection reasons if the image is likely to be rejected.",
    };

    try {
        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        acceptanceProbability: {
                            type: Type.INTEGER,
                            description: 'The probability (0-100) that this image would be accepted by a major stock photography agency.',
                        },
                        feedback: {
                            type: Type.STRING,
                            description: 'A brief, constructive feedback explaining the rationale behind the acceptance probability.',
                        },
                        rejectionReasons: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                            },
                            description: 'A list of specific, common rejection reasons if the probability is low (e.g., "Poor Lighting", "Out of Focus", "Visible Noise"). Can be empty if the image is good.',
                        },
                    },
                    required: ['acceptanceProbability', 'feedback', 'rejectionReasons'],
                },
            },
        });

        const jsonString = response.text.trim();
        const parsed = JSON.parse(jsonString);

        if (typeof parsed.acceptanceProbability === 'number' && typeof parsed.feedback === 'string' && Array.isArray(parsed.rejectionReasons)) {
            return parsed;
        } else {
            throw new Error('Invalid JSON structure in API response for image grading.');
        }
    } catch (error) {
        console.error("Error grading image:", error);
        throw error;
    }
};

export const generateTitleAndTagsForImage = async (imageBase64: string): Promise<{ title: string; keywords: string[] }> => {
    checkClient();
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
        },
    };
    const textPart = {
        text: "Generate a commercially viable title and a list of relevant keywords for this stock photo. The title should be descriptive and concise. The keywords should be relevant and useful for search.",
    };

    try {
        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: {
                            type: Type.STRING,
                            description: 'A short, descriptive, and commercially viable title for the image (under 100 characters).',
                        },
                        keywords: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                            },
                            description: 'A list of 10-15 relevant keywords, ordered by importance, for stock photography sites.',
                        },
                    },
                    required: ['title', 'keywords'],
                },
            },
        });

        const jsonString = response.text.trim();
        const parsed = JSON.parse(jsonString);

        if (typeof parsed.title === 'string' && Array.isArray(parsed.keywords)) {
            return parsed;
        } else {
            throw new Error('Invalid JSON structure in API response for image tagging.');
        }
    } catch (error) {
        console.error("Error generating tags for image:", error);
        throw error;
    }
};


export const generateSynopsisAndCharacters = async (title: string, genre: string): Promise<{ synopsis: string; characters: MovieCharacter[], fullStory: string }> => {
    checkClient();
    try {
        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the movie title "${title}" and the genre "${genre}", generate a compelling synopsis, a list of 2-3 main characters with detailed descriptions, and a full story narrative.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        synopsis: {
                            type: Type.STRING,
                            description: 'A short, compelling synopsis for the movie (2-3 sentences).',
                        },
                        characters: {
                            type: Type.ARRAY,
                            description: 'An array of 2-3 main characters, each with a name and a detailed description.',
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    description: { type: Type.STRING }
                                },
                                required: ['name', 'description']
                            }
                        },
                        fullStory: {
                            type: Type.STRING,
                            description: 'A cohesive story narrative (3-4 paragraphs) that follows the synopsis and characters.'
                        }
                    },
                    required: ['synopsis', 'characters', 'fullStory'],
                },
            },
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating synopsis and characters:", error);
        throw error;
    }
};

export const generateSceneBreakdown = async (synopsis: string, characters: MovieCharacter[], fullStory: string): Promise<{ scenes: Omit<MovieScene, 'id'>[] }> => {
    checkClient();
    try {
        const characterDescriptions = characters.map(c => `${c.name}: ${c.description}`).join('\n');
        const prompt = `Based on this full story:\n${fullStory}\n\nAnd these characters:\n${characterDescriptions}\n\nBreak the story down into 5-7 key scenes. For each scene, provide the following structured data:
1.  **principal_character_description**: A highly detailed, ultra-realistic cinematic description of the main character *as they appear in this specific scene*. **Do not just repeat their general description.** Instead, describe their current physical state, expression, clothing/fur/skin details reacting to the environment (e.g., dirt, rain, light), and emotional state. This description must be unique and context-aware for each scene while maintaining core character consistency.
2.  **scene_action**: A concise description of the character's actions in the scene.
3.  **cinematography**: Detailed cinematography notes (lens, resolution, focus, lighting, effects), suitable for a text-to-video model like VEO.
4.  **dialogue**: Any dialogue spoken. For each line, provide the character's name, their voice description, and the line itself. If no dialogue, provide an empty array.
5.  **characters_present**: A list of all character names in the scene.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scenes: {
                            type: Type.ARRAY,
                            description: 'An array of 5-7 scene objects.',
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    scene_number: { type: Type.INTEGER },
                                    principal_character_description: { type: Type.STRING, description: "An ultra-realistic cinematic description of the main character." },
                                    scene_action: { type: Type.STRING, description: "A concise description of the character's actions." },
                                    cinematography: { type: Type.STRING, description: "Detailed cinematography notes." },
                                    characters_present: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING }
                                    },
                                    dialogue: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                character: { type: Type.STRING },
                                                voice_description: { type: Type.STRING },
                                                line: { type: Type.STRING }
                                            },
                                            required: ['character', 'voice_description', 'line']
                                        }
                                    }
                                },
                                required: ['scene_number', 'principal_character_description', 'scene_action', 'cinematography', 'characters_present', 'dialogue']
                            }
                        },
                    },
                    required: ['scenes'],
                },
            },
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        result.scenes.forEach((scene: any) => {
            if (!scene.dialogue) scene.dialogue = [];
            if (!scene.characters_present) scene.characters_present = [];
        });
        return result;
    } catch (error) {
        console.error("Error generating scene breakdown:", error);
        throw error;
    }
};

export const extendMovieScene = async (synopsis: string, characters: MovieCharacter[], fullStory: string, sceneToExtend: MovieScene): Promise<Pick<MovieScene, 'principal_character_description' | 'scene_action' | 'cinematography' | 'dialogue'>> => {
    checkClient();
    try {
        const characterDescriptions = characters.map(c => `${c.name}: ${c.description}`).join('\n');
        
        const prompt = `You are a screenwriter extending a scene. Here is the full story context:\n
Full Story: ${fullStory}\n
Characters: ${characterDescriptions}\n
Here is the scene to extend (Scene ${sceneToExtend.scene_number}):
- Principal Character Description: "${sceneToExtend.principal_character_description}"
- Scene Action: "${sceneToExtend.scene_action}"
- Cinematography: "${sceneToExtend.cinematography}"
- Dialogue so far: ${sceneToExtend.dialogue.map(d => `${d.character}: "${d.line}"`).join(', ')}\n
Now, rewrite ONLY this scene to be more detailed.
- For **principal_character_description**, significantly elaborate on the character's appearance *in this moment*. Describe their expression, posture, and how the environment affects their look (e.g., sweat beading, clothes torn, glowing eyes). Make it vivid and unique to this extended moment. Do not simply copy the old description.
- Expand the **scene_action** with more specific actions and movements.
- Enhance the **cinematography** notes to be more dynamic and suitable for a VEO model.
- Add or expand **dialogue** snippets (including voice descriptions).
Ensure overall story consistency.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        principal_character_description: { type: Type.STRING },
                        scene_action: { type: Type.STRING },
                        cinematography: { type: Type.STRING },
                        dialogue: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    character: { type: Type.STRING },
                                    voice_description: { type: Type.STRING },
                                    line: { type: Type.STRING }
                                },
                                required: ['character', 'voice_description', 'line']
                            }
                        }
                    },
                    required: ['principal_character_description', 'scene_action', 'cinematography', 'dialogue'],
                },
            },
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        if (!result.dialogue) result.dialogue = [];
        return result;
    } catch (error) {
        console.error("Error extending scene:", error);
        throw error;
    }
};

export const generateNextScene = async (synopsis: string, characters: MovieCharacter[], fullStory: string, existingScenes: MovieScene[]): Promise<Omit<MovieScene, 'id'>> => {
    checkClient();
    try {
        const characterDescriptions = characters.map(c => `${c.name}: ${c.description}`).join('\n');
        const lastSceneNumber = existingScenes.length > 0 ? existingScenes[existingScenes.length - 1].scene_number : 0;
        const previousScenes = existingScenes.map(s => `Scene ${s.scene_number}: ${s.scene_action}`).join('\n\n');

        const prompt = `You are a screenwriter continuing a story.
Here is the full story context:
Full Story: ${fullStory}
Characters: ${characterDescriptions}

Here are the scenes so far:
${previousScenes}

Based on all of the above, write the next single scene in the story. It should be scene number ${lastSceneNumber + 1}.
For the new scene, provide the following structured data:
1.  **principal_character_description**: A highly detailed, ultra-realistic cinematic description of the main character *as they appear in this new scene*. **Do not just repeat their general description from the profile.** Describe their current physical state, expression, and reaction to the environment, making it unique and context-aware while maintaining core consistency.
2.  **scene_action**: A concise description of the character's actions.
3.  **cinematography**: Detailed cinematography notes for a text-to-video model like VEO.
4.  **dialogue**: Any dialogue spoken, with character name, voice description, and line.
5.  **characters_present**: A list of character names in the scene.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                         scene_number: { type: Type.INTEGER },
                        principal_character_description: { type: Type.STRING, description: "An ultra-realistic cinematic description of the main character." },
                        scene_action: { type: Type.STRING, description: "A concise description of the character's actions." },
                        cinematography: { type: Type.STRING, description: "Detailed cinematography notes." },
                        characters_present: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        dialogue: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    character: { type: Type.STRING },
                                    voice_description: { type: Type.STRING },
                                    line: { type: Type.STRING }
                                },
                                required: ['character', 'voice_description', 'line']
                            }
                        }
                    },
                    required: ['scene_number', 'principal_character_description', 'scene_action', 'cinematography', 'characters_present', 'dialogue'],
                },
            },
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        if (!result.dialogue) result.dialogue = [];
        if (!result.characters_present) result.characters_present = [];
        return result;
    } catch (error) {
        console.error("Error generating next scene:", error);
        throw error;
    }
};

// RC Crawler Studio Services

export const enhanceRCConcept = async (concept: string): Promise<string> => {
    checkClient();
    try {
        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Enhance this simple RC crawler video concept into a vivid, detailed, and cinematic one. Make it more descriptive and exciting. User concept: "${concept}"`,
            config: {
                systemInstruction: "You are a creative director for RC crawler videos. Rewrite the user's concept into a more engaging one. Output only the enhanced concept, with no preamble."
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error enhancing concept:", error);
        throw new Error('Failed to enhance concept.');
    }
};


const rcCrawlerSceneSchema = {
    type: Type.OBJECT,
    properties: {
        scene_number: { type: Type.INTEGER },
        crawler_description: { type: Type.STRING, description: "An ultra-realistic, scene-specific cinematic description of the main RC crawler." },
        scene_action: { type: Type.STRING, description: "A concise description of the crawler's actions, suitable for an 8-second clip." },
        environment: { type: Type.STRING, description: "A detailed description of the scene's environment and terrain." },
        cinematography: { type: Type.STRING, description: "Detailed cinematography notes for a VEO model (e.g., slow-motion, FPV drone)." },
        crawlers_present: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of all crawler names in the scene."
        },
    },
    required: ['scene_number', 'crawler_description', 'scene_action', 'environment', 'cinematography', 'crawlers_present']
};


export const generateRCCrawlerConcept = async (concept: string, crawlers: RCCrawlerCharacter[]): Promise<{ scenes: Omit<RCCrawlerScene, 'id'>[] }> => {
    checkClient();
    try {
        const crawlerDescriptions = crawlers.map(c => `- ${c.name}: A ${c.color} ${c.model}. Modifications: ${c.modifications}.`).join('\n');
        const prompt = `You are a creative director for RC crawler videos, specializing in prompts for advanced text-to-video models like VEO, which generates short, 8-second clips per prompt.

Video Concept: "${concept}"
RC Crawlers:
${crawlerDescriptions}

Generate a collection of 3-5 distinct, self-contained cinematic SHOTS based on this concept that form a cohesive journey.

**ULTRA-IMPORTANT: VEHICLE CONSISTENCY IS NON-NEGOTIABLE.**
The model, color, and modifications of each RC crawler listed above are **FIXED**. They **MUST NOT** change, be altered, or be replaced in any way across any of the scenes you generate. The user is creating a continuous video and any change to the vehicle will ruin the entire sequence. The only major element that should change is the immediate environment to show a journey.

**ADDITIONAL RULES:**
1.  The **'crawler_description'** for each scene should describe the vehicle's appearance *in that specific moment* (e.g., "The Bronco, now splattered with mud..."), but the underlying vehicle MUST be consistent with its initial description.
2.  **VARY THE ENVIRONMENT.** Each scene must take place in a slightly different but logically connected environment, showing the crawler progressing. The 'environment' field for each scene must be unique and detailed.
3.  Each 'scene_action' must describe a brief, specific action suitable for an 8-second clip.
4.  'cinematography' notes must be highly dynamic and specific for a VEO model (e.g., "Extreme slow-motion, 240fps, macro lens on tire tread gripping wet rock").

Provide the structured data for the shots.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scenes: {
                            type: Type.ARRAY,
                            description: 'An array of 3-5 scene objects, each representing an 8-second shot.',
                            items: rcCrawlerSceneSchema
                        },
                    },
                    required: ['scenes'],
                },
            },
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating RC crawler concept:", error);
        throw error;
    }
};

export const extendRCCrawlerScene = async (concept: string, crawlers: RCCrawlerCharacter[], sceneToExtend: RCCrawlerScene): Promise<Omit<RCCrawlerScene, 'id' | 'scene_number' | 'crawlers_present'>> => {
    checkClient();
    try {
        const crawlerDescriptions = crawlers.map(c => `- ${c.name}: A ${c.color} ${c.model}. Modifications: ${c.modifications}.`).join('\n');
        
        const prompt = `You are a creative director extending an RC crawler video shot for a VEO-style model (8-second clips).
Video Concept: "${concept}"
RC Crawlers:
${crawlerDescriptions}

Here is the 8-second shot to extend (Scene ${sceneToExtend.scene_number}):
- Environment: "${sceneToExtend.environment}"
- Crawler Description: "${sceneToExtend.crawler_description}"
- Scene Action: "${sceneToExtend.scene_action}"
- Cinematography: "${sceneToExtend.cinematography}"

Now, rewrite ONLY this shot to be more detailed and vivid, keeping the action suitable for 8 seconds.
- For **crawler_description**, significantly elaborate on the vehicle's appearance *in this specific moment*.
- Expand the **scene_action** with more specific movements without making it too long for an 8-second clip.
- Enhance the **environment** description with more sensory details.
- Add more dynamic and specific **cinematography** notes.
- **IMPORTANT**: You must maintain consistency with the crawler's base model and the established environment.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        crawler_description: { type: Type.STRING },
                        scene_action: { type: Type.STRING },
                        environment: { type: Type.STRING },
                        cinematography: { type: Type.STRING },
                    },
                    required: ['crawler_description', 'scene_action', 'environment', 'cinematography'],
                },
            },
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error extending RC scene:", error);
        throw error;
    }
};

export const generateNextRCCrawlerScene = async (concept: string, crawlers: RCCrawlerCharacter[], existingScenes: RCCrawlerScene[], shotType: ShotType): Promise<Omit<RCCrawlerScene, 'id'>> => {
    checkClient();
    try {
        const crawlerDescriptions = crawlers.map(c => `- ${c.name}: A ${c.color} ${c.model}. Mods: ${c.modifications}.`).join('\n');
        const lastSceneNumber = existingScenes.length > 0 ? existingScenes[existingScenes.length - 1].scene_number : 0;
        const previousScenes = existingScenes.map(s => `Scene ${s.scene_number}: [Environment: ${s.environment}] [Action: ${s.scene_action}]`).join('\n');
        
        const shotInstruction = shotType && shotType !== 'Any'
            ? `The next shot MUST be a "${shotType}". A "${shotType}" is defined as: ${
                shotType === 'Establishing Shot' ? 'A wide, scenic shot to show the overall location.' :
                shotType === 'Action Shot' ? 'A dynamic shot focusing on the crawler\'s movement.' :
                shotType === 'Detail Shot' ? 'An extreme close-up on a specific part like suspension, wheels, or mud.' :
                'A dramatic, epic, slow-motion shot of the crawler.'
              }`
            : 'Decide on the best type of shot to follow the previous scenes.';

        const prompt = `You are a creative director for an RC crawler video, generating a new shot for a VEO-style model (8-second clips).

Video Concept: "${concept}"
RC Crawlers:
${crawlerDescriptions}

Here are the shots generated so far:
${previousScenes}

Based on the above, create the next single, distinct 8-second cinematic shot in the journey. It should be scene number ${lastSceneNumber + 1}.
${shotInstruction}

**ULTRA-IMPORTANT: VEHICLE CONSISTENCY IS NON-NEGOTIABLE.**
The RC crawlers defined MUST maintain their exact appearance (model, color, modifications) from the previous scenes. **DO NOT CHANGE THE VEHICLE.** The goal is to create the *next logical step* in a continuous journey. Only the immediate environment and the crawler's interaction with it (e.g., getting muddy) should change. The core vehicle is immutable.

**ADDITIONAL RULES:**
1.  **CREATE A NEW ENVIRONMENT.** The environment for this new scene must be different from the previous scenes, showing a progression in the crawler's journey.
2.  The **'crawler_description'** should describe the vehicle's appearance *in this new moment*, reflecting the new environment, but the underlying vehicle MUST remain consistent.
3.  The **'scene_action'** must be a brief, specific action suitable for an 8-second clip that fits the requested shot type.
4.  The **'cinematography'** must be dynamic and specific for a VEO model.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: rcCrawlerSceneSchema,
            },
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating next RC scene:", error);
        throw error;
    }
};

// ASMR Studio Services
const asmrSceneSchema = {
    type: Type.OBJECT,
    properties: {
        scene_number: { type: Type.INTEGER },
        timestamp: { type: Type.STRING, description: "The time range for this scene, e.g., '0:30 - 1:00'." },
        action_description: { type: Type.STRING, description: "A detailed description of the ASMRtist's actions." },
        sound_description: { type: Type.STRING, description: "A very specific description of the sounds being produced, focusing on trigger words." },
        visual_description: { type: Type.STRING, description: "Detailed cinematography notes (e.g., 'Macro shot of fingertips tapping on glass')." },
        triggers_present: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of the primary ASMR triggers featured in this scene."
        },
    },
    required: ['scene_number', 'timestamp', 'action_description', 'sound_description', 'visual_description', 'triggers_present']
};


export const generateASMRConcept = async (concept: string, triggers: string[], setting: string, characters: ASMRCharacter[]): Promise<{ scenes: Omit<ASMRScene, 'id'>[] }> => {
    checkClient();
    const characterDescriptions = characters.map(c => `- ${c.name}: ${c.description}`).join('\n');
    const prompt = `You are a creative director for ASMR videos, specializing in creating scripts for text-to-video models.

Video Concept: "${concept}"
Primary ASMR Triggers: ${triggers.join(', ')}
Setting: ${setting}
${characters.length > 0 ? `ASMRtist(s):\n${characterDescriptions}` : ''}

Generate a script with 3-5 distinct scenes for a relaxing ASMR video based on the provided details. Each scene should represent a segment of the video.

**RULES:**
1.  **Focus on Sound:** The 'sound_description' must be extremely detailed, using evocative onomatopoeia and adjectives to describe the ASMR triggers.
2.  **Visuals Support Sound:** The 'visual_description' should complement the sounds (e.g., close-ups on hands, macro shots of textures).
3.  **Logical Flow:** The scenes should progress logically to create a cohesive and relaxing experience.
4.  Provide the output in the specified structured data format.`;

    try {
        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scenes: {
                            type: Type.ARRAY,
                            description: 'An array of 3-5 ASMR scene objects.',
                            items: asmrSceneSchema
                        },
                    },
                    required: ['scenes'],
                },
            },
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating ASMR concept:", error);
        throw error;
    }
};

export const extendASMRScene = async (concept: string, sceneToExtend: ASMRScene): Promise<Omit<ASMRScene, 'id' | 'scene_number' | 'triggers_present'>> => {
    checkClient();
    const prompt = `You are an ASMR scriptwriter, extending a scene to be more detailed and immersive.

Video Concept: "${concept}"
Original Scene (Scene ${sceneToExtend.scene_number}):
- Timestamp: ${sceneToExtend.timestamp}
- Action: ${sceneToExtend.action_description}
- Sound: ${sceneToExtend.sound_description}
- Visual: ${sceneToExtend.visual_description}

Now, rewrite ONLY this scene to be more detailed.
- Expand the **action_description** with more nuanced movements.
- Enhance the **sound_description** with more vivid onomatopoeia and descriptive adjectives.
- Make the **visual_description** more specific and cinematic.
- Keep the **timestamp** the same.`;

    try {
        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        timestamp: { type: Type.STRING },
                        action_description: { type: Type.STRING },
                        sound_description: { type: Type.STRING },
                        visual_description: { type: Type.STRING },
                    },
                    required: ['timestamp', 'action_description', 'sound_description', 'visual_description'],
                },
            },
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error extending ASMR scene:", error);
        throw error;
    }
};

export const generateNextASMRScene = async (concept: string, existingScenes: ASMRScene[]): Promise<Omit<ASMRScene, 'id'>> => {
    checkClient();
    const lastSceneNumber = existingScenes.length > 0 ? existingScenes[existingScenes.length - 1].scene_number : 0;
    const previousScenes = existingScenes.map(s => `Scene ${s.scene_number} (${s.timestamp}): [Sound: ${s.sound_description}] [Action: ${s.action_description}]`).join('\n');
    
    const prompt = `You are an ASMR scriptwriter, creating the next scene in a sequence.

Video Concept: "${concept}"
Scenes so far:
${previousScenes}

Based on the above, create the next logical scene in the ASMR video. It should be scene number ${lastSceneNumber + 1}.

Provide the following structured data for the new scene:
1.  **timestamp**: A logical next time range.
2.  **action_description**: The actions performed by the ASMRtist.
3.  **sound_description**: Detailed description of the trigger sounds.
4.  **visual_description**: Cinematic and visual details.
5.  **triggers_present**: List of primary triggers in this new scene.`;

    try {
        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: asmrSceneSchema,
            },
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating next ASMR scene:", error);
        throw error;
    }
};
