import { MediaEditorSchema } from '../src/schemas/project-config';
import { describe, it, expect } from 'vitest';

const exampleMediaEditorProject: any = {
    metadata: {
        name: "Example Project",
        version: "1.0.0",
        created_at: "2025-02-20T12:00:00Z",
        last_modified: "2025-02-20T12:00:00Z"
    },
    assets: [
        {
            id: "asset1",
            type: "video",
            path: "/path/to/video.mp4",
            metadata: {
                duration: 120,
                resolution: "1920x1080",
                codec: "H.264",
                bitrate: "320kbps"
            }
        }
    ],
    timeline: {
        tracks: [
            {
                id: "track1",
                type: "video",
                clips: [
                    {
                        asset_id: "asset1",
                        start_time: 0,
                        end_time: 120,
                        position: 0
                    }
                ]
            }
        ]
    },
    settings: {
        resolution: "1920x1080",
        framerate: 30,
        output_format: "mp4"
    },
    state: {
        ui: {
            zoom_level: 1.0,
            current_time_cursor: 0
        }
    }
};

describe("Media Editor Project Config", () => {
    it("should validate example project", () => {
        expect(() => MediaEditorSchema.parse(exampleMediaEditorProject)).not.toThrow();
    });

    it("should throw error for invalid project", () => {
        exampleMediaEditorProject.metadata.name = 123;
        expect(() => MediaEditorSchema.parse(exampleMediaEditorProject)).toThrow();
        exampleMediaEditorProject.metadata.name = "Example Project";
    });

    it("should validate example project", () => {
        exampleMediaEditorProject.assets[0].metadata.duration = "120";
        expect(() => MediaEditorSchema.parse(exampleMediaEditorProject)).toThrow();
        exampleMediaEditorProject.assets[0].metadata.duration = 120;
    });

    it("should validate example project", () => {
        exampleMediaEditorProject.assets[0].type = "sdfdsf";
        expect(() => MediaEditorSchema.parse(exampleMediaEditorProject)).toThrow();
        exampleMediaEditorProject.assets[0].type = "video";
    });
});
