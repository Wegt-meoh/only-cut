pub struct AppData {
    x_len: u32,
    y_len: u32,
}

impl AppData {
    pub fn set_app_size(mut self, new_x: u32, new_y: u32) {
        self.x_len = new_x;
        self.y_len = new_y;
    }

    pub fn app_data(new_x: u32, new_y: u32) -> Self {
        AppData {
            x_len: new_x,
            y_len: new_y,
        }
    }
}
