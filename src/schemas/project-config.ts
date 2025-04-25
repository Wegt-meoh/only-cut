import * as z from "../utils/z";

const clipSchema = z.object({
    asset_id: z.string(),
    start_time: z.number(),
    end_time: z.number(),
    position: z.number(),
});

const assetMetadataSchema = z.object({
    duration: z.number(),
    resolution: z.string(),
    codec: z.string(),
    bitrate: z.string(),
});

const assetSchema = z.object({
    id: z.string(),
    type: z.enum(["video", "audio", "image"]),
    path: z.string(),
    metadata: assetMetadataSchema,
});

type DirSchema = {
    name: string
    children: Array<z.infer<typeof assetSchema> | DirSchema>
};

const dirSchema: z.AnyShemaType<DirSchema> = z.lazy(() => z.object({
    name: z.string(),
    children: z.array(z.union([assetSchema, dirSchema])),
}));

const trackSchema = z.object({
    id: z.string(),
    type: z.enum(["video", "audio", "image"]),
    clips: z.array(clipSchema),
});

export const MediaEditorSchema = z.object({
    metadata: z.object({
        version: z.string(),
        created_at: z.string(),
        last_modified: z.string(),
        cover_path: z.union([z.string(), z.null()]),
    }),
    assets: z.array(z.union([dirSchema, assetSchema])),
    timeline: z.object({
        tracks: z.array(trackSchema),
    }),
    settings: z.object({
        resolution: z.union([z.string(), z.null()]),
        framerate: z.union([z.number(), z.null()]),
        output_format: z.union([z.string(), z.null()]),
    }),
    state: z.object({
        ui: z.object({
            zoom_level: z.number(),
            current_time_cursor: z.number(),
        }),
    }),
});
