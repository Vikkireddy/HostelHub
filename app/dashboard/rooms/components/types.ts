import { DEFAULT_AC_TYPE } from "../rooms.constants";

export interface Room {
  id: number;
  number: string;
  floor: number;
  type: string;
  ac_type?: string;
  capacity: number;
  occupancy: number;
  status: string;
  rent: number;
}

export type RoomForm = {
  number: string;
  floor: string;
  type: string;
  ac_type: string;
  capacity: string;
  rent: string;
  status: string;
};

export const initialForm: RoomForm = {
  number: "",
  floor: "",
  type: "",
  ac_type: DEFAULT_AC_TYPE,
  capacity: "",
  rent: "",
  status: "available",
};
