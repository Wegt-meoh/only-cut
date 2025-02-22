import * as z from "../utils/z";

export interface MediaEditorProject {
    metadata: {
        name: string;
        version: string;
        created_at: string; // ISO 8601 date string
        last_modified: string; // ISO 8601 date string
    };
    assets: Asset[];
    timeline: {
        tracks: Track[];
    };
    settings: {
        resolution: string | null; // e.g., "1920x1080"
        framerate: number | null; // e.g., 30
        output_format: string | null; // e.g., "mp4"
    };
    state: {
        ui: {
            zoom_level: number; // e.g., 1.0
            current_time_cursor: number; // Current time in seconds
        };
    };
}

interface Asset {
    id: string; // Unique identifier
    type: "video" | "audio" | "image";
    path: string; // Relative or absolute path
    metadata: AssetMetadata;
}

interface AssetMetadata {
    duration: number; // In seconds (for video/audio)
    resolution: string; // e.g., "1920x1080" (for video/images)
    codec: string; // e.g., "H.264" (for video)
    bitrate: string; // e.g., "320kbps" (for audio)
}

interface Track {
    id: string; // Unique identifier
    type: "video" | "audio" | "image";
    clips: Clip[];
}

interface Clip {
    asset_id: string; // Reference to an Asset
    start_time: number; // Start time in seconds
    end_time: number; // End time in seconds
    position: number; // Position in timeline
}

const assetMetadataSchema = z.object({
    duration: z.number(),
    resolution: z.string(),
    codec: z.string(),
    bitrate: z.string()
})

const assetSchema = z.object({
    id: z.string(),
    type: z.enumSchema(["video", "audio", "image"]),
    path: z.string(),
    metadata: assetMetadataSchema
})

const trackSchema = z.object({
    id: z.string(),
    type: z.enumSchema(["video", "audio", "image"]),
    clips: z.array(z.object({
        asset_id: z.string(),
        start_time: z.number(),
        end_time: z.number(),
        position: z.number()
    }))
})

export const MediaEditorSchema = z.object({
    metadata: z.object({
        name: z.string(),
        version: z.string(),
        created_at: z.string(),
        last_modified: z.string()
    }),
    assets: z.array(assetSchema),
    timeline: z.object({
        tracks: z.array(trackSchema)
    }),
    settings: z.object({
        resolution: z.union([z.string(), z.nullObj()]),
        framerate: z.union([z.number(), z.nullObj()]),
        output_format: z.union([z.string(), z.nullObj()])
    }),
    state: z.object({
        ui: z.object({
            zoom_level: z.number(),
            current_time_cursor: z.number()
        })
    })
})