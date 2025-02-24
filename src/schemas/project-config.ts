import * as z from "../utils/z";

const clipSchema = z.object({
    asset_id: z.string(),
    start_time: z.number(),
    end_time: z.number(),
    position: z.number()
})

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
    clips: z.array(clipSchema)
})

export const MediaEditorSchema = z.object({
    metadata: z.object({
        name: z.string(),
        version: z.string(),
        created_at: z.string(),
        last_modified: z.string(),
        cover_path: z.union([z.string(), z.nullObj()])
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