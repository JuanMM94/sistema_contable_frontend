import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Splitter } from "./Splitter";
import styles from "../../app/page.module.css"

export const CardBalace = () => {
  return (
    <Card className="w-full max-w-80">
        <CardHeader className="flex justify-center items-center">
          <CardTitle>Balance ARS</CardTitle>
          <CardContent>
            <h4>$556.058</h4>
          </CardContent>
        </CardHeader>
        <Splitter/>
        <CardFooter className={styles.ctas}>
          <Button variant={"outline"}>Ultimos Movimientos</Button>
          <Button variant={"outline"}>Cambiar a peso</Button>
        </CardFooter>
      </Card>
  )
}