import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;

@WebServlet("/SaveProduct")
public class SaveProduct extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        
        // Retrieve data from the add_products.html form
        String pId = request.getParameter("pId");
        String pName = request.getParameter("pName");
        String pCat = request.getParameter("pCategory");
        String pPrice = request.getParameter("pPrice");
        String pStock = request.getParameter("pStock");

        // Format: ID,Name,Category,Price,Stock
        String dataLine = pId + "," + pName + "," + pCat + "," + pPrice + "," + pStock;

        // Path where inventory.txt will be stored (root folder)
        String path = getServletContext().getRealPath("/") + "inventory.txt";
        
        try (FileWriter fw = new FileWriter(path, true);
             BufferedWriter bw = new BufferedWriter(fw);
             PrintWriter out = new PrintWriter(bw)) {
            
            out.println(dataLine);
            
            // Redirect back to the store page after saving
            response.sendRedirect("order.html");
        } catch (IOException e) {
            response.getWriter().println("Error saving to file: " + e.getMessage());
        }
    }
}