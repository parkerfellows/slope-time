"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  PlanRequestSchema,
  type PlanRequest,
  RESORTS,
  ABILITY_LEVELS,
  OPTIMIZATION_GOALS,
  TERRAIN_TYPES,
} from "@/lib/schema/planRequest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RESORT_LABELS: Record<string, string> = {
  "deer-valley": "Deer Valley Resort",
  "park-city": "Park City Mountain",
  snowbird: "Snowbird",
  brighton: "Brighton Resort",
  solitude: "Solitude Mountain Resort",
  "best-available": "Best available (app chooses)",
};

const ABILITY_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

const GOAL_LABELS: Record<string, string> = {
  "max-runs": "Max runs",
  "max-vertical": "Max vertical",
  "max-difficulty": "Max difficulty",
  balanced: "Balanced",
};

const TERRAIN_LABELS: Record<string, string> = {
  groomers: "Groomers",
  moguls: "Moguls",
  trees: "Trees",
  bowls: "Bowls",
  park: "Park",
};

interface Props {
  onSubmit: (data: PlanRequest) => Promise<void>;
  isLoading: boolean;
  defaultResort?: PlanRequest["resort"];
}

/** Format a Date as the "YYYY-MM-DDTHH:MM" string that datetime-local expects */
function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

/** Returns today's date at the given HH:MM as a datetime-local string */
function todayAt(hh: number, mm = 0): string {
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return toDatetimeLocal(d);
}

export function PlanForm({ onSubmit, isLoading, defaultResort = "best-available" }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlanRequest>({
    resolver: zodResolver(PlanRequestSchema),
    defaultValues: {
      windowStart: todayAt(7, 0),   // 07:00 today
      windowEnd: todayAt(14, 0),    // 14:00 today
      resort: defaultResort,
      optimizationGoal: "balanced",
      abilityLevel: "intermediate",
      terrainPreferences: ["groomers"],
    },
  });

  const terrainPrefs = watch("terrainPreferences") ?? [];

  function toggleTerrain(terrain: (typeof TERRAIN_TYPES)[number]) {
    if (terrainPrefs.includes(terrain)) {
      setValue(
        "terrainPreferences",
        terrainPrefs.filter((t) => t !== terrain),
        { shouldValidate: true }
      );
    } else {
      setValue("terrainPreferences", [...terrainPrefs, terrain], {
        shouldValidate: true,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Time window */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="windowStart">Leave home</Label>
          <Input
            id="windowStart"
            type="datetime-local"
            {...register("windowStart")}
          />
          {errors.windowStart && (
            <p className="text-xs text-destructive">{errors.windowStart.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="windowEnd">Must be back by</Label>
          <Input
            id="windowEnd"
            type="datetime-local"
            {...register("windowEnd")}
          />
          {errors.windowEnd && (
            <p className="text-xs text-destructive">{errors.windowEnd.message}</p>
          )}
        </div>
      </div>

      {/* Starting location */}
      <div className="space-y-1.5">
        <Label htmlFor="startingLocation">Starting location</Label>
        <Input
          id="startingLocation"
          type="text"
          placeholder="e.g. Salt Lake City, UT"
          {...register("startingLocation")}
        />
        {errors.startingLocation && (
          <p className="text-xs text-destructive">{errors.startingLocation.message}</p>
        )}
      </div>

      {/* Resort */}
      <div className="space-y-1.5">
        <Label>Resort</Label>
        <Select
          defaultValue={defaultResort}
          onValueChange={(v) =>
            setValue("resort", v as PlanRequest["resort"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a resort" />
          </SelectTrigger>
          <SelectContent>
            {RESORTS.map((r) => (
              <SelectItem key={r} value={r}>
                {RESORT_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.resort && (
          <p className="text-xs text-destructive">{errors.resort.message}</p>
        )}
      </div>

      {/* Ability level + optimization goal */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Ability level</Label>
          <Select
            defaultValue="intermediate"
            onValueChange={(v) =>
              setValue("abilityLevel", v as PlanRequest["abilityLevel"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ABILITY_LEVELS.map((l) => (
                <SelectItem key={l} value={l}>
                  {ABILITY_LABELS[l]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Optimize for</Label>
          <Select
            defaultValue="balanced"
            onValueChange={(v) =>
              setValue("optimizationGoal", v as PlanRequest["optimizationGoal"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPTIMIZATION_GOALS.map((g) => (
                <SelectItem key={g} value={g}>
                  {GOAL_LABELS[g]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Terrain preferences */}
      <div className="space-y-2">
        <Label>Terrain preferences</Label>
        <div className="flex flex-wrap gap-4">
          {TERRAIN_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={terrainPrefs.includes(t)}
                onCheckedChange={() => toggleTerrain(t)}
              />
              <span className="text-sm">{TERRAIN_LABELS[t]}</span>
            </label>
          ))}
        </div>
        {errors.terrainPreferences && (
          <p className="text-xs text-destructive">
            {errors.terrainPreferences.message}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Building your plan…
          </>
        ) : (
          "Plan my day"
        )}
      </Button>
    </form>
  );
}
