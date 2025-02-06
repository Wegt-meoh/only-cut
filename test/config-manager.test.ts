import { MediaEditorProject } from '../src/types/project-config'
import { persistProjectConfig } from '../src/utils/config-manager'

const config: MediaEditorProject = {
    metadata: {
        name: 'hello',
        author: 'xxx',
        created_at: '2000/01/01',
        last_modified: '2000/02/01',
        version: 'v1.0'
    },
    assets: [{
        id: 'dsfd', path: 'fdsf',
        type: 'video',
        metadata: { bitrate: '2000kbps', codec: 'hevc', duration: 69, resolution: '1098x1090' }
    }],
    settings: {
        resolution: '1920x1080',
        framerate: 60,
        output_format: 'mp4'
    },
    state: {
        ui: {
            current_time_cursor: 121,
            zoom_level: 0
        }
    },
    timeline: {
        tracks: [
            {
                id: '12312',
                type: 'video',
                clips: [
                    {
                        asset_id: 'sdf',
                        start_time: 0,
                        end_time: 20,
                        position: 0
                    }
                ]
            }
        ]
    }
}

await persistProjectConfig(config)