package com.concessionaria.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String storageLocation;
    private final String publicUrlPrefix;

    public WebConfig(@Value("${app.storage.location}") String storageLocation,
                      @Value("${app.storage.public-url-prefix}") String publicUrlPrefix) {
        this.storageLocation = storageLocation;
        this.publicUrlPrefix = publicUrlPrefix;
    }

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        String pattern = publicUrlPrefix.endsWith("/") ? publicUrlPrefix + "**" : publicUrlPrefix + "/**";
        String location = "file:" + Paths.get(storageLocation).toAbsolutePath().normalize() + "/";
        registry.addResourceHandler(pattern).addResourceLocations(location);
    }
}
