package com.concessionaria.seo;

import com.concessionaria.vehicle.VehicleRepository;
import com.concessionaria.vehicle.VehicleStatus;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Generates sitemap.xml dynamically from the current catalog instead of a static
 * file, so newly published/removed vehicles are reflected without a frontend
 * rebuild. In production, the public site's reverse proxy should route
 * {@code /sitemap.xml} to this endpoint (the frontend is a static SPA build
 * and has no server-side component of its own to generate this).
 */
@RestController
@Tag(name = "SEO")
public class SitemapController {

    private final VehicleRepository vehicleRepository;
    private final String siteUrl;

    public SitemapController(VehicleRepository vehicleRepository,
                              @Value("${app.public-site-url}") String siteUrl) {
        this.vehicleRepository = vehicleRepository;
        this.siteUrl = siteUrl.endsWith("/") ? siteUrl.substring(0, siteUrl.length() - 1) : siteUrl;
    }

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String sitemap() {
        List<String> slugs = vehicleRepository.findSlugsByStatusIn(List.copyOf(VehicleStatus.PUBLICLY_VISIBLE));

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        appendUrl(xml, siteUrl + "/", "daily", "1.0");
        appendUrl(xml, siteUrl + "/veiculos", "hourly", "0.9");
        for (String slug : slugs) {
            appendUrl(xml, siteUrl + "/veiculos/" + slug, "weekly", "0.7");
        }
        xml.append("</urlset>\n");
        return xml.toString();
    }

    private void appendUrl(StringBuilder xml, String location, String changeFrequency, String priority) {
        xml.append("  <url>\n")
                .append("    <loc>").append(escapeXml(location)).append("</loc>\n")
                .append("    <changefreq>").append(changeFrequency).append("</changefreq>\n")
                .append("    <priority>").append(priority).append("</priority>\n")
                .append("  </url>\n");
    }

    private String escapeXml(String value) {
        return value.replace("&", "&amp;").replace("\"", "&quot;")
                .replace("'", "&apos;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
