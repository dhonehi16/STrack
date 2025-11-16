export interface Contact {
  id: number;
  user_id: number;
  contact_id: number;
  contact_name: string;
  is_sharing_location: boolean
}

export interface User {
  id: number;
  username: string;
}

