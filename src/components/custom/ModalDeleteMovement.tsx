import { Movement } from '@/lib/schemas';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { useAdminContext } from '@/providers/AdminFetchProvider';

export default function DeleteMovementDialog({ movement }: { movement: Movement }) {
  const { deleteMovement } = useAdminContext();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button type="button" className="text-red-600 hover:underline cursor-pointer">
          Borrar
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar movimiento</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción es permanente. ¿Estas seguro de borrar este movimiento?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={async () => {
              await deleteMovement({ movementId: movement.id });
            }}
          >
            Borrar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
