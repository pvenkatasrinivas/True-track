package com.truetrack.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** End-to-end tests of the task API (security + controller + service + repository + H2). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String token;

    /** Every test starts by registering a user and keeping the JWT. */
    @BeforeEach
    void registerUser() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        token = objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    void tasksRequireLogin() throws Exception {
        mockMvc.perform(get("/api/tasks")).andExpect(status().isUnauthorized());
    }

    @Test
    void fullCrudFlow() throws Exception {
        // CREATE
        long id = createTask("Fix login bug", "HIGH", null);

        // READ one
        mockMvc.perform(get("/api/tasks/" + id).header("Authorization", bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Fix login bug"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.createdAt", notNullValue()));

        // UPDATE
        String update = "{\"title\":\"Fix login bug on mobile\",\"description\":\"Only on Android\","
                + "\"assignedTo\":\"Priya\",\"priority\":\"MEDIUM\",\"status\":\"IN_PROGRESS\"}";
        mockMvc.perform(put("/api/tasks/" + id).header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON).content(update))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Fix login bug on mobile"))
                .andExpect(jsonPath("$.assignedTo").value("Priya"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        // UPDATE STATUS
        mockMvc.perform(patch("/api/tasks/" + id + "/status").header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"COMPLETED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        // DELETE
        mockMvc.perform(delete("/api/tasks/" + id).header("Authorization", bearer()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/tasks/" + id).header("Authorization", bearer()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Task not found with id " + id));
    }

    @Test
    void invalidTaskReturnsValidationErrors() throws Exception {
        mockMvc.perform(post("/api/tasks").header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"ab\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.title").value("Title must be between 3 and 100 characters"))
                .andExpect(jsonPath("$.fieldErrors.priority").value("Priority is required"));
    }

    @Test
    void invalidEnumValueReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/tasks").header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"Valid title\",\"priority\":\"URGENT\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void searchAndFilters() throws Exception {
        createTask("Fix printer", "HIGH", "PENDING");
        createTask("Order printer paper", "LOW", "COMPLETED");
        createTask("Update payroll", "HIGH", "IN_PROGRESS");

        mockMvc.perform(get("/api/tasks").header("Authorization", bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));

        mockMvc.perform(get("/api/tasks").param("search", "PRINTER").header("Authorization", bearer()))
                .andExpect(jsonPath("$", hasSize(2)));

        mockMvc.perform(get("/api/tasks").param("status", "COMPLETED").header("Authorization", bearer()))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Order printer paper"));

        mockMvc.perform(get("/api/tasks").param("priority", "HIGH").header("Authorization", bearer()))
                .andExpect(jsonPath("$", hasSize(2)));

        mockMvc.perform(get("/api/tasks").param("search", "printer").param("priority", "HIGH")
                        .header("Authorization", bearer()))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Fix printer"));

        mockMvc.perform(get("/api/tasks").param("status", "DONE").header("Authorization", bearer()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void summaryCountsTasksByStatus() throws Exception {
        createTask("Task one", "HIGH", "PENDING");
        createTask("Task two", "HIGH", "COMPLETED");
        createTask("Task three", "LOW", "IN_PROGRESS");

        mockMvc.perform(get("/api/tasks/summary").header("Authorization", bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3))
                .andExpect(jsonPath("$.pending").value(1))
                .andExpect(jsonPath("$.inProgress").value(1))
                .andExpect(jsonPath("$.completed").value(1))
                .andExpect(jsonPath("$.highPriority").value(1))
                .andExpect(jsonPath("$.recentTasks", hasSize(3)));
    }

    @Test
    void unknownIdReturnsNotFound() throws Exception {
        mockMvc.perform(patch("/api/tasks/12345/status").header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"COMPLETED\"}"))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/tasks/12345").header("Authorization", bearer()))
                .andExpect(status().isNotFound());
    }

    // ---------- helpers ----------

    private String bearer() {
        return "Bearer " + token;
    }

    private long createTask(String title, String priority, String status) throws Exception {
        String body = "{\"title\":\"" + title + "\",\"priority\":\"" + priority + "\""
                + (status != null ? ",\"status\":\"" + status + "\"" : "") + "}";
        MvcResult result = mockMvc.perform(post("/api/tasks").header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("id").asLong();
    }
}
