import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const CardBalace = () => {
  return (
    <Card className="w-full gap-3 h-24 flex justify-center">
      <CardHeader className="flex justify-center items-center">
        <CardTitle>Balance ARS</CardTitle>
        <CardTitle>$556.058</CardTitle>
      </CardHeader>
      {/* <Splitter/> */}
      <CardFooter className="flex items-center justify-center gap-2 p-2">
        <Button variant={"outline"}>Ultimos Movimientos</Button>
        <Button variant={"outline"}>Cambiar a peso</Button>
      </CardFooter>
    </Card>
  )
}