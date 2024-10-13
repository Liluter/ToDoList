export interface Sync {
  full_sync: boolean,
  sync_status: {
    [key: string]: {
      error: string,
      error_code: number,
      error_extra: {},
      error_tag: string,
      http_code: number
    } | string
  },
  sync_token: string
  temp_id_mapping: {}
}