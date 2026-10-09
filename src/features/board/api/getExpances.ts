import { queryClient } from "@/app/query-client";
import type {
  ExpanseControllerHandleExpanseListQueryResult,
  expanseControllerHandleExpanseListResponse,
} from "@/shared/model/petstore";
import { useQuery } from "@tanstack/react-query";

export const expansesList = () => {
  const list = useQuery;
};
