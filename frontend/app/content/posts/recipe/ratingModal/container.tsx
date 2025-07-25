import { useFieldState } from "@/hooks/useFieldState";
import { PostData, PostState } from "../../controller";
import RatingModalComponent from "./component";
import useRatingModalController from "./controller";

type Props = {
  postData: PostData;
  post: ReturnType<typeof useFieldState<PostState>>;
};

export default function RatingModalContainer({ postData, post }: Props) {
  const { rating, submitRating } = useRatingModalController(postData, post);

  return <RatingModalComponent rating={rating} submitRating={submitRating} />;
}
