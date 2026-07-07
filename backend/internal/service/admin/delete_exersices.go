package adminservice

import "context"

func (s Service) DeleteExercise(ctx context.Context, id string) error {
	return s.exerciseRepo.DeleteExercise(ctx, id)
}
