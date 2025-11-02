import java.util.ArrayList;
import java.util.List;

final class Pizza {
  private final String size;
  private final boolean cheese;
  private final boolean pepperoni;
  private final boolean beacon;
  private final List<String> extraToppings;

  private Pizza(PizzaBuilder builder) {
    this.size = builder.size;
    this.cheese = builder.cheese;
    this.pepperoni = builder.pepperoni;
    this.beacon = builder.beacon;
    this.extraToppings = builder.extraToppings;
  }

  static class PizzaBuilder {
    private final String size;
    private boolean cheese = false;
    private boolean pepperoni = false;
    private boolean beacon = false;
    private List<String> extraToppings = new ArrayList<>();

    PizzaBuilder(String size) {
      this.size = size;
    }

    public PizzaBuilder addCheese(boolean cheese) {
      this.cheese = cheese;
      return this;
    }

    public PizzaBuilder addPepperoni(boolean pepperoni) {
      this.pepperoni = pepperoni;
      return this;
    }

    public PizzaBuilder addBeacon(boolean beacon) {
      this.beacon = beacon;
      return this;
    }

    public PizzaBuilder addExtraToppings(List<String> extraToppings) {
      this.extraToppings = extraToppings;
      return this;
    }

    public Pizza build() {
      return new Pizza(this);
    }

  }

  public void Describe() {
    System.out.println(this.size);
    System.out.println(this.cheese);
  }

}

public class App {
  public static void main(String[] args) {

    Pizza order = new Pizza.PizzaBuilder("Large")
        .addCheese(true)
        .build();

    order.Describe();
  }
}