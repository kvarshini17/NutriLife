package servlets;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * Servlet implementation class LoginServlet
 * Endpoint Route: /servlets/LoginServlet
 */
@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    // JDBC connection configurations
    private String dbURL = "jdbc:mysql://localhost:3306/nutrition_store";
    private String dbUsername = "root";
    private String dbPassword = "nutrition_password_123";

    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        
        HttpSession session = request.getSession();
        
        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            request.setAttribute("errorMessage", "Credentials cannot be empty!");
            request.getRequestDispatcher("/login.html").forward(request, response);
            return;
        }

        try {
            // Load MySQL JDBC Driver
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection conn = DriverManager.getConnection(dbURL, dbUsername, dbPassword);
            
            String sql = "SELECT * FROM users WHERE email = ? AND password = ?";
            PreparedStatement statement = conn.prepareStatement(sql);
            statement.setString(1, email);
            statement.setString(2, password); // Standard lookup
            
            ResultSet result = statement.executeQuery();
            
            if (result.next()) {
                // User active inside ResultSet
                session.setAttribute("user_id", result.getInt("id"));
                session.setAttribute("user_name", result.getString("name"));
                session.setAttribute("user_email", result.getString("email"));
                
                // Redirecting to JSP dashboard module
                response.sendRedirect(request.getContextPath() + "/jsp/dashboard.jsp");
            } else {
                request.setAttribute("errorMessage", "Invalid server credentials combination.");
                request.getRequestDispatcher("/login.html").forward(request, response);
            }
            
            conn.close();
        } catch (Exception ex) {
            request.setAttribute("errorMessage", "JDBC Driver connection issue: " + ex.getMessage());
            request.getRequestDispatcher("/login.html").forward(request, response);
        }
    }
}
