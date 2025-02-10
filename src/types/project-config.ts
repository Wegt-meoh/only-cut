export interface MediaEditorProject {
    metadata: {
        name: string;
        version: string;
        author: string;
        created_at: string; // ISO 8601 date string
        last_modified: string; // ISO 8601 date string
    };
    assets: Asset[];
    timeline: {
        tracks: Track[];
    };
    settings: {
        resolution: string; // e.g., "1920x1080"
        framerate: number; // e.g., 30
        output_format: string; // e.g., "mp4"
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
