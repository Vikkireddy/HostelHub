import { DEFAULT_AC_TYPE } from "../rooms.constants";

export interface Room {
  id: number;
  number: string;
  floor: number;
  ac_type?: string;
  capacity: number;
  occupancy: number;
  status: string;
}

export type RoomForm = {
  number: string;
  floor: string;
  ac_type: string;
  capacity: string;
  status: string;
};

export const initialForm: RoomForm = {
  number: "",
  floor: "",
  ac_type: DEFAULT_AC_TYPE,
  capacity: "",
  status: "available",
};
