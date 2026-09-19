package com.concessionaria.seed;

import com.concessionaria.brand.Brand;
import com.concessionaria.brand.BrandRepository;
import com.concessionaria.category.Category;
import com.concessionaria.category.CategoryRepository;
import com.concessionaria.common.SlugUtils;
import com.concessionaria.settings.DealershipSettings;
import com.concessionaria.settings.DealershipSettingsRepository;
import com.concessionaria.user.User;
import com.concessionaria.user.UserRepository;
import com.concessionaria.user.UserRole;
import com.concessionaria.vehicle.FuelType;
import com.concessionaria.vehicle.TechnicalSpecification;
import com.concessionaria.vehicle.TransmissionType;
import com.concessionaria.vehicle.Vehicle;
import com.concessionaria.vehicle.VehicleImage;
import com.concessionaria.vehicle.VehicleRepository;
import com.concessionaria.vehicle.VehicleStatus;
import com.concessionaria.vehicle.VehicleType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Populates a fresh development database with an admin user, default dealership
 * settings and a demo catalog. Runs only under the "dev" profile and is idempotent
 * (safe to run every startup) — never runs in production.
 */
@Component
@Profile("dev")
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final VehicleRepository vehicleRepository;
    private final DealershipSettingsRepository settingsRepository;
    private final PasswordEncoder passwordEncoder;

    private final boolean seedEnabled;
    private final String adminName;
    private final String adminEmail;
    private final String adminPassword;

    public DataSeeder(UserRepository userRepository, BrandRepository brandRepository,
                       CategoryRepository categoryRepository, VehicleRepository vehicleRepository,
                       DealershipSettingsRepository settingsRepository, PasswordEncoder passwordEncoder,
                       @Value("${app.seed.enabled:false}") boolean seedEnabled,
                       @Value("${app.admin.name:Administrador}") String adminName,
                       @Value("${app.admin.email:}") String adminEmail,
                       @Value("${app.admin.password:}") String adminPassword) {
        this.userRepository = userRepository;
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
        this.vehicleRepository = vehicleRepository;
        this.settingsRepository = settingsRepository;
        this.passwordEncoder = passwordEncoder;
        this.seedEnabled = seedEnabled;
        this.adminName = adminName;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            return;
        }
        seedAdminUser();
        seedSettings();
        if (vehicleRepository.count() == 0) {
            seedCatalog();
        }
    }

    private void seedAdminUser() {
        if (!StringUtils.hasText(adminEmail) || !StringUtils.hasText(adminPassword)) {
            log.warn("APP_ADMIN_EMAIL/APP_ADMIN_PASSWORD não configurados — usuário admin de desenvolvimento não foi criado.");
            return;
        }
        if (userRepository.existsByEmailIgnoreCase(adminEmail)) {
            return;
        }
        User admin = new User();
        admin.setName(adminName);
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRole(UserRole.ADMIN);
        admin.setActive(true);
        userRepository.save(admin);
        log.info("Usuário administrador de desenvolvimento criado: {}", adminEmail);
    }

    private void seedSettings() {
        if (settingsRepository.count() > 0) {
            return;
        }
        DealershipSettings settings = new DealershipSettings();
        settings.setDealershipName("Prime Motors Concessionária");
        settings.setWhatsapp("5511999999999");
        settings.setPhone("(11) 4002-8922");
        settings.setInstagram("@primemotors");
        settings.setAddress("Av. das Nações, 1500");
        settings.setCity("São Paulo");
        settings.setState("SP");
        settings.setOpeningHours("Seg a Sex 09:00-18:00 · Sáb 09:00-13:00");
        settings.setDescription("Concessionária multimarcas com veículos revisados e procedência garantida.");
        settingsRepository.save(settings);
    }

    private void seedCatalog() {
        Map<String, Brand> brands = createBrands();
        Map<String, Category> categories = createCategories();

        int imageSeed = 1;
        imageSeed = seedVehicle(brands.get("Toyota"), categories.get("Sedan"), VehicleType.CARRO,
                "Corolla", "XEi 2.0 Flex 16V Aut.", 2022, 32000, bd(129900), null,
                FuelType.FLEX, TransmissionType.AUTOMATICO, "Prata", VehicleStatus.DISPONIVEL, true,
                spec("2.0 16V", "2.0L", "177 cv", "21,1 kgfm", "Dianteira", bd(9.8), bd(13.4), bd(50), 4, 5,
                        bd(1345), bd(4630), bd(1780), bd(1435)), imageSeed);

        imageSeed = seedVehicle(brands.get("Honda"), categories.get("Sedan"), VehicleType.CARRO,
                "Civic", "Touring 1.5 Turbo", 2023, 18000, bd(159900), bd(154900),
                FuelType.GASOLINA, TransmissionType.CVT, "Preto", VehicleStatus.DISPONIVEL, true,
                spec("1.5 Turbo", "1.5L", "173 cv", "22,4 kgfm", "Dianteira", bd(10.5), bd(14.1), bd(47), 4, 5,
                        bd(1330), bd(4678), bd(1802), bd(1415)), imageSeed);

        imageSeed = seedVehicle(brands.get("Volkswagen"), categories.get("Hatch"), VehicleType.CARRO,
                "Polo", "Highline 200 TSI", 2021, 41000, bd(89900), null,
                FuelType.FLEX, TransmissionType.AUTOMATIZADO, "Branco", VehicleStatus.DISPONIVEL, false,
                spec("1.0 TSI", "1.0L", "128 cv", "20,4 kgfm", "Dianteira", bd(11.8), bd(15.6), bd(50), 4, 5,
                        bd(1090), bd(4070), bd(1751), bd(1461)), imageSeed);

        imageSeed = seedVehicle(brands.get("Chevrolet"), categories.get("SUV"), VehicleType.CARRO,
                "Tracker", "Premier 1.2 Turbo", 2023, 12000, bd(139900), null,
                FuelType.FLEX, TransmissionType.AUTOMATICO, "Cinza", VehicleStatus.DISPONIVEL, true,
                spec("1.2 Turbo", "1.2L", "133 cv", "22,4 kgfm", "Dianteira", bd(10.2), bd(13.9), bd(44), 4, 5,
                        bd(1290), bd(4264), bd(1791), bd(1652)), imageSeed);

        imageSeed = seedVehicle(brands.get("Hyundai"), categories.get("SUV"), VehicleType.CARRO,
                "Creta", "Ultimate 2.0 Flex Aut.", 2022, 28000, bd(124900), null,
                FuelType.FLEX, TransmissionType.AUTOMATICO, "Vermelho", VehicleStatus.RESERVADO, false,
                spec("2.0 16V", "2.0L", "149 cv", "19,3 kgfm", "Dianteira", bd(9.6), bd(12.8), bd(50), 4, 5,
                        bd(1330), bd(4315), bd(1790), bd(1635)), imageSeed);

        imageSeed = seedVehicle(brands.get("Fiat"), categories.get("Hatch"), VehicleType.CARRO,
                "Argo", "Drive 1.0 Firefly", 2020, 55000, bd(64900), bd(61900),
                FuelType.FLEX, TransmissionType.MANUAL, "Branco", VehicleStatus.DISPONIVEL, false,
                spec("1.0 Firefly", "1.0L", "77 cv", "10,4 kgfm", "Dianteira", bd(12.9), bd(16.2), bd(48), 4, 5,
                        bd(998), bd(4029), bd(1740), bd(1489)), imageSeed);

        imageSeed = seedVehicle(brands.get("Jeep"), categories.get("SUV"), VehicleType.CARRO,
                "Compass", "Longitude 1.3 Turbo", 2023, 15000, bd(169900), null,
                FuelType.FLEX, TransmissionType.AUTOMATICO, "Preto", VehicleStatus.DISPONIVEL, true,
                spec("1.3 Turbo", "1.3L", "185 cv", "27,5 kgfm", "Dianteira", bd(9.1), bd(12.4), bd(60), 4, 5,
                        bd(1495), bd(4404), bd(1874), bd(1641)), imageSeed);

        imageSeed = seedVehicle(brands.get("Toyota"), categories.get("Picape"), VehicleType.CARRO,
                "Hilux", "SRX 2.8 Diesel 4x4", 2021, 62000, bd(219900), null,
                FuelType.DIESEL, TransmissionType.AUTOMATICO, "Prata", VehicleStatus.DISPONIVEL, false,
                spec("2.8 Turbo Diesel", "2.8L", "204 cv", "50,9 kgfm", "4x4", bd(8.9), bd(10.6), bd(80), 4, 5,
                        bd(2135), bd(5330), bd(1855), bd(1815)), imageSeed);

        imageSeed = seedVehicle(brands.get("Chevrolet"), categories.get("Utilitario"), VehicleType.CARRO,
                "Montana", "LTZ 1.2 Turbo", 2024, 5000, bd(134900), null,
                FuelType.FLEX, TransmissionType.AUTOMATICO, "Cinza", VehicleStatus.DISPONIVEL, true,
                spec("1.2 Turbo", "1.2L", "133 cv", "22,4 kgfm", "Dianteira", bd(10.8), bd(14.5), bd(44), 2, 5,
                        bd(1305), bd(4770), bd(1810), bd(1650)), imageSeed);

        imageSeed = seedVehicle(brands.get("Volkswagen"), categories.get("Sedan"), VehicleType.CARRO,
                "Virtus", "Comfortline 200 TSI", 2020, 48000, bd(79900), null,
                FuelType.FLEX, TransmissionType.AUTOMATIZADO, "Prata", VehicleStatus.VENDIDO, false,
                spec("1.0 TSI", "1.0L", "116 cv", "20,4 kgfm", "Dianteira", bd(12.1), bd(16.0), bd(50), 4, 5,
                        bd(1145), bd(4482), bd(1751), bd(1469)), imageSeed);

        imageSeed = seedVehicle(brands.get("Honda"), categories.get("Hatch"), VehicleType.CARRO,
                "Fit", "EXL 1.5 Flex Aut.", 2019, 71000, bd(72900), null,
                FuelType.FLEX, TransmissionType.CVT, "Azul", VehicleStatus.DISPONIVEL, false,
                spec("1.5 16V", "1.5L", "116 cv", "15,3 kgfm", "Dianteira", bd(11.5), bd(15.0), bd(40), 4, 5,
                        bd(1140), bd(4090), bd(1695), bd(1524)), imageSeed);

        imageSeed = seedVehicle(brands.get("Yamaha"), categories.get("Naked"), VehicleType.MOTO,
                "MT-03", "ABS", 2023, 6000, bd(29900), null,
                FuelType.GASOLINA, TransmissionType.MANUAL, "Azul", VehicleStatus.DISPONIVEL, true,
                spec("2 cilindros", "321cc", "42 cv", "3,0 kgfm", "N/A", null, null, bd(14), null, 2,
                        bd(168), null, null, null), imageSeed);

        seedVehicle(brands.get("Jeep"), categories.get("SUV"), VehicleType.CARRO,
                "Renegade", "Sport 1.3 Turbo", 2022, 34000, bd(109900), null,
                FuelType.FLEX, TransmissionType.AUTOMATICO, "Branco", VehicleStatus.INATIVO, false,
                spec("1.3 Turbo", "1.3L", "185 cv", "27,5 kgfm", "Dianteira", bd(9.3), bd(12.7), bd(52), 4, 5,
                        bd(1370), bd(4249), bd(1859), bd(1666)), imageSeed);

        log.info("Catálogo de demonstração criado com sucesso.");
    }

    private Map<String, Brand> createBrands() {
        Map<String, Brand> brands = new java.util.HashMap<>();
        for (String name : new String[]{"Toyota", "Honda", "Volkswagen", "Chevrolet", "Hyundai", "Fiat", "Jeep", "Yamaha"}) {
            Brand brand = new Brand();
            brand.setName(name);
            brand.setActive(true);
            brands.put(name, brandRepository.save(brand));
        }
        return brands;
    }

    private Map<String, Category> createCategories() {
        Map<String, Category> categories = new java.util.HashMap<>();
        for (String name : new String[]{"Sedan", "SUV", "Hatch", "Picape", "Utilitario", "Naked"}) {
            Category category = new Category();
            category.setName(name);
            category.setActive(true);
            categories.put(name, categoryRepository.save(category));
        }
        return categories;
    }

    @SuppressWarnings("java:S107")
    private int seedVehicle(Brand brand, Category category, VehicleType type, String model, String version,
                             int year, int mileage, BigDecimal price, BigDecimal promotionalPrice, FuelType fuel,
                             TransmissionType transmission, String color, VehicleStatus status, boolean featured,
                             TechnicalSpecification specification, int imageSeed) {
        Vehicle vehicle = new Vehicle();
        vehicle.setBrand(brand);
        vehicle.setCategory(category);
        vehicle.setVehicleType(type);
        vehicle.setModel(model);
        vehicle.setVersion(version);
        vehicle.setYear(year);
        vehicle.setMileage(mileage);
        vehicle.setPrice(price);
        vehicle.setPromotionalPrice(promotionalPrice);
        vehicle.setFuel(fuel);
        vehicle.setTransmission(transmission);
        vehicle.setColor(color);
        vehicle.setStatus(status);
        vehicle.setFeatured(featured);
        vehicle.setDescription(brand.getName() + " " + model + " " + version + ", ano " + year
                + ", revisado e pronto para rodar. Único dono, procedência garantida.");
        vehicle.setSlug(uniqueSlug(brand.getName(), model, version, year));

        specification.setVehicle(vehicle);
        vehicle.setTechnicalSpecification(specification);

        for (int i = 0; i < 3; i++) {
            VehicleImage image = new VehicleImage();
            image.setVehicle(vehicle);
            image.setImageUrl("https://picsum.photos/seed/veiculo-" + imageSeed + "-" + i + "/1200/800");
            image.setStoragePath("external/seed-" + imageSeed + "-" + i);
            image.setPrimary(i == 0);
            image.setDisplayOrder(i);
            vehicle.getImages().add(image);
        }

        vehicleRepository.save(vehicle);
        return imageSeed + 1;
    }

    private String uniqueSlug(String brandName, String model, String version, int year) {
        String base = SlugUtils.slugify(brandName + "-" + model + "-" + version + "-" + year);
        String candidate = base;
        int suffix = 2;
        while (vehicleRepository.existsBySlug(candidate)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    private TechnicalSpecification spec(String engine, String displacement, String horsepower, String torque,
                                         String traction, BigDecimal urbanConsumption, BigDecimal highwayConsumption,
                                         BigDecimal fuelTank, Integer doors, Integer seats, BigDecimal weight,
                                         BigDecimal length, BigDecimal width, BigDecimal height) {
        TechnicalSpecification specification = new TechnicalSpecification();
        specification.setEngine(engine);
        specification.setDisplacement(displacement);
        specification.setHorsepower(horsepower);
        specification.setTorque(torque);
        specification.setTraction(traction);
        specification.setUrbanConsumption(urbanConsumption);
        specification.setHighwayConsumption(highwayConsumption);
        specification.setFuelTankCapacity(fuelTank);
        specification.setDoors(doors);
        specification.setSeats(seats);
        specification.setWeight(weight);
        specification.setLength(length);
        specification.setWidth(width);
        specification.setHeight(height);
        return specification;
    }

    private BigDecimal bd(double value) {
        return BigDecimal.valueOf(value);
    }
}
